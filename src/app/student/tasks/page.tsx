import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { requireStudent } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db";
import Task from "@/models/Task";
import User from "@/models/User";
import { StudentTaskList, StudentTaskViewItem } from "@/components/StudentTaskList";
import { ChevronRight, ArrowLeft, Sparkles, CheckSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Tasks - Bright English Garden",
  description: "View and complete your assigned English tasks and view teacher feedback.",
};

export default async function StudentTasksPage() {
  const session = await requireStudent();
  await connectToDatabase();

  const isTeacher = session.role === "teacher";
  const studentDoc = !isTeacher ? await User.findById(session.userId).lean() : null;

  const studentGrade = studentDoc?.grade || session.grade || 1;
  const accessAllGrades = isTeacher || Boolean(studentDoc?.accessAllGrades);

  const permittedGrades = accessAllGrades
    ? [1, 2, 3, 4, 5]
    : Array.from(new Set([studentGrade, ...(studentDoc?.allowedGrades || [])]));

  // Query tasks assigned to all, or to student's grade, or specifically to this student
  const query: any = {
    $or: [
      { targetType: "all" },
      { targetType: "grade", targetGrade: { $in: permittedGrades } },
      { targetType: "student", targetStudentId: studentDoc?._id || session.userId },
    ],
  };

  const rawTasks = await Task.find(query).sort({ createdAt: -1 }).lean();

  const formattedTasks: StudentTaskViewItem[] = rawTasks.map((t) => {
    const mySub = (t.submissions || []).find(
      (s: any) => s.studentId.toString() === session.userId
    );

    return {
      id: t._id.toString(),
      title: t.title,
      description: t.description,
      targetType: t.targetType,
      targetGrade: t.targetGrade,
      dueDate: t.dueDate?.toISOString(),
      teacherName: t.teacherName,
      attachmentName: t.attachmentName,
      attachmentSize: t.attachmentSize,
      attachmentMimeType: t.attachmentMimeType,
      createdAt: t.createdAt.toISOString(),
      mySubmission: mySub
        ? {
            status: mySub.status,
            submittedAt: mySub.submittedAt.toISOString(),
            studentNote: mySub.studentNote,
            attachmentName: mySub.attachmentName,
            attachmentSize: mySub.attachmentSize,
            attachmentMimeType: mySub.attachmentMimeType,
            teacherFeedback: mySub.teacherFeedback,
            teacherRating: mySub.teacherRating,
            reviewedAt: mySub.reviewedAt?.toISOString(),
          }
        : undefined,
    };
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3]">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Header & Breadcrumbs */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-xs font-semibold text-stone-500 mb-3" aria-label="Breadcrumb">
            <Link href="/student" className="hover:text-emerald-700 transition-colors">
              My Learning Library
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-stone-800">My Tasks</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Grade {studentGrade} Mission Center</span>
              </div>
              <h1
                className="text-2xl sm:text-3xl font-bold text-stone-900"
                style={{ fontFamily: "var(--font-fredoka)" }}
              >
                My English Tasks & Missions 🎒
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Tick your completed homework tasks to get feedback, stars, and stickers from your teacher!
              </p>
            </div>

            <Link
              href="/student"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-200 bg-white text-stone-700 font-semibold text-xs hover:bg-stone-50 transition-colors shadow-xs w-fit cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Library</span>
            </Link>
          </div>
        </div>

        {/* Task List */}
        <StudentTaskList tasks={formattedTasks} />
      </main>

      <Footer />
    </div>
  );
}
