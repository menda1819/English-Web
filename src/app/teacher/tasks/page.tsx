import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { requireTeacher } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db";
import Task from "@/models/Task";
import User from "@/models/User";
import { AssignTaskForm } from "@/components/AssignTaskForm";
import { TeacherTaskList, TaskItem } from "@/components/TeacherTaskList";
import { ChevronRight, ArrowLeft, CheckSquare, Bell, Award, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Classroom Tasks - Teacher Desk",
  description: "Assign classroom tasks, review student work, and send personalized teacher feedback.",
};

export default async function TeacherTasksPage() {
  const teacher = await requireTeacher();
  await connectToDatabase();

  const [rawTasks, rawStudents] = await Promise.all([
    Task.find().sort({ createdAt: -1 }).lean(),
    User.find({ role: "student", status: "active" })
      .select("_id name grade")
      .sort({ grade: 1, name: 1 })
      .lean(),
  ]);

  const students = rawStudents.map((s) => ({
    id: s._id.toString(),
    name: s.name,
    grade: s.grade || 1,
  }));

  const tasks: TaskItem[] = rawTasks.map((t) => ({
    id: t._id.toString(),
    title: t.title,
    description: t.description,
    targetType: t.targetType,
    targetGrade: t.targetGrade,
    targetStudentName: t.targetStudentName,
    dueDate: t.dueDate?.toISOString(),
    attachmentName: t.attachmentName,
    attachmentSize: t.attachmentSize,
    attachmentMimeType: t.attachmentMimeType,
    createdAt: t.createdAt.toISOString(),
    submissions: (t.submissions || []).map((sub) => ({
      studentId: sub.studentId.toString(),
      studentName: sub.studentName,
      studentGrade: sub.studentGrade,
      studentAvatar: sub.studentAvatar,
      status: sub.status,
      submittedAt: sub.submittedAt.toISOString(),
      studentNote: sub.studentNote,
      attachmentName: sub.attachmentName,
      attachmentSize: sub.attachmentSize,
      attachmentMimeType: sub.attachmentMimeType,
      teacherFeedback: sub.teacherFeedback,
      teacherRating: sub.teacherRating,
      reviewedAt: sub.reviewedAt?.toISOString(),
    })),
  }));

  const totalNeedsReview = tasks.reduce((acc, t) => {
    return acc + t.submissions.filter((s) => s.status === "done" && !s.teacherFeedback).length;
  }, 0);

  const totalCompletedSubmissions = tasks.reduce((acc, t) => acc + t.submissions.length, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Header & Breadcrumb */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-xs font-semibold text-stone-500 mb-3" aria-label="Breadcrumb">
            <Link href="/teacher" className="hover:text-emerald-700 transition-colors">
              Teacher Desk
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-stone-800">Classroom Tasks</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full">
                  Tasks & Missions
                </span>
                {totalNeedsReview > 0 && (
                  <span className="text-xs font-extrabold text-rose-800 bg-rose-100 border border-rose-300 px-3 py-1 rounded-full flex items-center gap-1 animate-pulse">
                    <Bell className="w-3.5 h-3.5 text-rose-600" />
                    <span>{totalNeedsReview} Submissions Waiting for Review!</span>
                  </span>
                )}
              </div>
              <h1
                className="text-2xl sm:text-3xl font-bold text-stone-900 mt-2"
                style={{ fontFamily: "var(--font-fredoka)" }}
              >
                Classroom Tasks & Student Feedback 📋
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Assign tasks by grade or student, track completions, and provide personalized star ratings and feedback.
              </p>
            </div>

            <Link
              href="/teacher"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-200 bg-white text-stone-700 font-semibold text-xs hover:bg-stone-50 transition-colors shadow-xs w-fit cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-bold text-stone-900 block" style={{ fontFamily: "var(--font-fredoka)" }}>
                {tasks.length}
              </span>
              <span className="text-xs text-stone-500 font-semibold">Total Assigned Tasks</span>
            </div>
          </div>

          <div
            className={`rounded-3xl p-5 border shadow-xs flex items-center gap-4 transition-all ${
              totalNeedsReview > 0
                ? "bg-rose-50 border-rose-300 ring-2 ring-rose-200"
                : "bg-white border-stone-200"
            }`}
          >
            <div
              className={`p-3 rounded-2xl ${
                totalNeedsReview > 0 ? "bg-rose-500 text-white animate-bounce" : "bg-stone-100 text-stone-600"
              }`}
            >
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <span
                className={`text-2xl font-bold block ${totalNeedsReview > 0 ? "text-rose-900" : "text-stone-900"}`}
                style={{ fontFamily: "var(--font-fredoka)" }}
              >
                {totalNeedsReview}
              </span>
              <span className="text-xs font-semibold text-stone-600">Pending Teacher Reviews</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-bold text-stone-900 block" style={{ fontFamily: "var(--font-fredoka)" }}>
                {totalCompletedSubmissions}
              </span>
              <span className="text-xs text-stone-500 font-semibold">Total Completed Missions</span>
            </div>
          </div>
        </div>

        {/* Assign Task Section */}
        <div className="mb-8">
          <AssignTaskForm students={students} />
        </div>

        {/* Task List & Review Submissions */}
        <TeacherTaskList tasks={tasks} />
      </main>

      <Footer />
    </div>
  );
}
