import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { requireTeacher } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db";
import TeacherWorkItem from "@/models/TeacherWorkItem";
import {
  TeacherPlannerView,
  SerializedTeacherWorkItem,
} from "@/components/TeacherPlannerView";
import { ChevronRight, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "School Work & Task Planner - Teacher Desk",
  description:
    "Private school work, lesson plans, exams, marks, to-dos and classroom reminder manager for teachers.",
};

export default async function TeacherPlannerPage() {
  const teacher = await requireTeacher();
  await connectToDatabase();

  const rawItems = await TeacherWorkItem.find({ teacherId: teacher.userId })
    .sort({ isPinned: -1, dueDate: 1, createdAt: -1 })
    .lean();

  const items: SerializedTeacherWorkItem[] = rawItems.map((item) => ({
    _id: item._id.toString(),
    title: item.title,
    category: item.category,
    priority: item.priority,
    status: item.status,
    targetGrade: item.targetGrade ?? null,
    dueDate: item.dueDate ? item.dueDate.toISOString() : null,
    notes: item.notes || "",
    isPinned: Boolean(item.isPinned),
    completedAt: item.completedAt ? item.completedAt.toISOString() : null,
    createdAt: item.createdAt ? item.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: item.updatedAt ? item.updatedAt.toISOString() : new Date().toISOString(),
  }));

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 mb-6">
          <Link
            href="/teacher"
            className="hover:text-emerald-700 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Teacher Desk</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-emerald-800 font-bold">School Work & Planner</span>
        </div>

        {/* Interactive Planner View */}
        <TeacherPlannerView initialItems={items} teacherName={teacher.name} />
      </main>

      <Footer />
    </div>
  );
}
