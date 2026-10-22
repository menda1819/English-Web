import React from "react";
import Link from "next/link";
import { requireStudent } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { ProfileForm } from "@/components/ProfileForm";
import { ChevronRight, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentProfilePage() {
  const session = await requireStudent();
  await connectToDatabase();

  const user = await User.findById(session.userId).lean();
  if (!user) {
    return <div>User not found.</div>;
  }

  const initialUser = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    grade: user.grade,
    avatar: user.avatar,
    accessAllGrades: user.accessAllGrades,
    allowedGrades: user.allowedGrades,
    createdAt: user.createdAt?.toISOString(),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Header & Breadcrumb */}
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-xs font-semibold text-stone-500 mb-3" aria-label="Breadcrumb">
          <Link href="/student" className="hover:text-emerald-700 transition-colors">
            My Learning Library
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-800">My Student Profile</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1
              className="text-2xl sm:text-3xl font-bold text-stone-900"
              style={{ fontFamily: "var(--font-fredoka)" }}
            >
              My Garden Profile & Mascot 🎒
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Customize your student name, login username, classroom mascot, and password.
            </p>
          </div>

          <Link
            href="/student"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-200 bg-white text-stone-700 font-semibold text-xs hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 transition-colors shadow-xs w-fit cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Learning Library</span>
          </Link>
        </div>
      </div>

      {/* Main Profile Form */}
      <ProfileForm initialUser={initialUser} />
    </div>
  );
}
