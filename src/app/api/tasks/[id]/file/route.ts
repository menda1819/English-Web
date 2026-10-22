import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db";
import Task from "@/models/Task";
import User from "@/models/User";
import { downloadResourceFile } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "task";
    const studentId = searchParams.get("studentId");

    await connectToDatabase();
    const task = await Task.findById(id);

    if (!task) {
      return new NextResponse("Task not found", { status: 404 });
    }

    let storageKey = "";
    let mimeType = "application/octet-stream";
    let filename = "document";

    if (type === "task") {
      // Teacher task attachment
      if (!task.attachmentStorageKey) {
        return new NextResponse("No attachment found for this task", { status: 404 });
      }

      // If student, check permission
      if (session.role === "student") {
        const studentDoc = await User.findById(session.userId).lean();
        const studentGrade = studentDoc?.grade || session.grade || 1;
        const accessAll = Boolean(studentDoc?.accessAllGrades);
        const permitted = accessAll
          ? [1, 2, 3, 4, 5]
          : Array.from(new Set([studentGrade, ...(studentDoc?.allowedGrades || [])]));

        const hasAccess =
          task.targetType === "all" ||
          (task.targetType === "grade" && permitted.includes(task.targetGrade!)) ||
          (task.targetType === "student" && task.targetStudentId?.toString() === session.userId);

        if (!hasAccess) {
          return new NextResponse("Forbidden: You cannot access this task attachment", { status: 403 });
        }
      }

      storageKey = task.attachmentStorageKey;
      mimeType = task.attachmentMimeType || "application/pdf";
      filename = task.attachmentName || "task_document.pdf";
    } else if (type === "submission") {
      // Student work submission attachment
      const targetStudent = studentId || (session.role === "student" ? session.userId : null);

      if (!targetStudent) {
        return new NextResponse("Student ID is required to fetch submission attachment", { status: 400 });
      }

      // If student, verify they are fetching their own
      if (session.role === "student" && targetStudent !== session.userId) {
        return new NextResponse("Forbidden: You can only access your own submission file", { status: 403 });
      }

      const submission = task.submissions.find(
        (s: any) => s.studentId.toString() === targetStudent
      );

      if (!submission || !submission.attachmentStorageKey) {
        return new NextResponse("No attachment found for this student submission", { status: 404 });
      }

      storageKey = submission.attachmentStorageKey;
      mimeType = submission.attachmentMimeType || "application/pdf";
      filename = submission.attachmentName || "student_submission.pdf";
    } else {
      return new NextResponse("Invalid attachment type", { status: 400 });
    }

    const fileBuffer = await downloadResourceFile(storageKey, "mongodb-gridfs", mimeType);

    const safeName = filename.replace(/[^\w.-]/g, "_");

    return new Response(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${safeName}"`,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err: any) {
    console.error("Error streaming task attachment:", err);
    return new NextResponse(err.message || "Internal Server Error", { status: 500 });
  }
}
