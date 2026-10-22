import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db";
import Resource from "@/models/Resource";
import { downloadResourceFile } from "@/lib/storage";

import User from "@/models/User";

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

    await connectToDatabase();
    const resource = await Resource.findById(id);

    if (!resource) {
      return new NextResponse("Resource not found", { status: 404 });
    }

    // Access control:
    // If student, the resource MUST be published AND match student's permitted grades
    if (session.role === "student") {
      if (resource.publicationStatus !== "published") {
        return new NextResponse("Forbidden: This resource is not published", { status: 403 });
      }

      const studentDoc = await User.findById(session.userId).lean();
      const studentPrimaryGrade = studentDoc?.grade || session.grade || 1;
      const accessAllGrades = Boolean(studentDoc?.accessAllGrades);
      const permittedGrades = accessAllGrades
        ? [1, 2, 3, 4, 5]
        : Array.from(
            new Set([studentPrimaryGrade, ...(studentDoc?.allowedGrades || [])])
          );

      const hasGradeAccess = resource.grades.some((g: number) =>
        permittedGrades.includes(g)
      );

      if (!hasGradeAccess) {
        return new NextResponse(
          "Forbidden: You do not have permission to access materials for this grade. Please ask your teacher.",
          { status: 403 }
        );
      }
    }

    const fileBuffer = await downloadResourceFile(
      resource.storageKey,
      resource.storageProvider,
      resource.mimeType
    );

    const isDownload = request.nextUrl.searchParams.get("download") === "true";
    const dispositionType = isDownload ? "attachment" : "inline";

    const response = new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": resource.mimeType || "application/octet-stream",
        "Content-Length": fileBuffer.length.toString(),
        "Content-Disposition": `${dispositionType}; filename="${encodeURIComponent(resource.safeFileName)}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, max-age=3600",
      },
    });

    return response;
  } catch (err) {
    console.error("Error serving resource file:", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
