"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusCircle, Users, BookOpen, User, Settings } from "lucide-react";

export function TeacherNavLinks() {
  const pathname = usePathname();

  const isDashboardActive = pathname === "/teacher";
  const isAddResourceActive = pathname === "/teacher/resources/new";
  const isStudentsActive = pathname.startsWith("/teacher/students");
  const isProfileActive = pathname === "/teacher/profile";
  const isStudentViewActive = pathname.startsWith("/student");

  return (
    <nav className="hidden md:flex items-center gap-1.5" aria-label="Teacher navigation">
      {/* Dashboard */}
      <Link
        href="/teacher"
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all duration-150 cursor-pointer ${
          isDashboardActive
            ? "bg-emerald-100 text-emerald-900 font-bold border border-emerald-300 shadow-xs"
            : "text-stone-700 hover:text-emerald-800 hover:bg-emerald-50/80 font-semibold border border-transparent"
        }`}
        aria-current={isDashboardActive ? "page" : undefined}
      >
        <LayoutDashboard
          className={`w-4 h-4 ${isDashboardActive ? "text-emerald-700" : "text-emerald-600"}`}
        />
        <span>Dashboard</span>
        {isDashboardActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 ml-0.5" />}
      </Link>

      {/* Add Resource */}
      <Link
        href="/teacher/resources/new"
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all duration-150 cursor-pointer ${
          isAddResourceActive
            ? "bg-emerald-100 text-emerald-900 font-bold border border-emerald-300 shadow-xs"
            : "text-stone-700 hover:text-emerald-800 hover:bg-emerald-50/80 font-semibold border border-transparent"
        }`}
        aria-current={isAddResourceActive ? "page" : undefined}
      >
        <PlusCircle
          className={`w-4 h-4 ${isAddResourceActive ? "text-emerald-700" : "text-emerald-600"}`}
        />
        <span>Add Resource</span>
        {isAddResourceActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 ml-0.5" />}
      </Link>

      {/* Students */}
      <Link
        href="/teacher/students"
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all duration-150 cursor-pointer ${
          isStudentsActive
            ? "bg-emerald-100 text-emerald-900 font-bold border border-emerald-300 shadow-xs"
            : "text-stone-700 hover:text-emerald-800 hover:bg-emerald-50/80 font-semibold border border-transparent"
        }`}
        aria-current={isStudentsActive ? "page" : undefined}
      >
        <Users
          className={`w-4 h-4 ${isStudentsActive ? "text-emerald-700" : "text-emerald-600"}`}
        />
        <span>Students</span>
        {isStudentsActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 ml-0.5" />}
      </Link>

      {/* Profile */}
      <Link
        href="/teacher/profile"
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all duration-150 cursor-pointer ${
          isProfileActive
            ? "bg-emerald-100 text-emerald-900 font-bold border border-emerald-300 shadow-xs"
            : "text-stone-700 hover:text-emerald-800 hover:bg-emerald-50/80 font-semibold border border-transparent"
        }`}
        aria-current={isProfileActive ? "page" : undefined}
      >
        <Settings
          className={`w-4 h-4 ${isProfileActive ? "text-emerald-700" : "text-emerald-600"}`}
        />
        <span>Profile</span>
        {isProfileActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 ml-0.5" />}
      </Link>

      {/* Student View (Preview) */}
      <Link
        href="/student"
        prefetch={false}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all duration-150 cursor-pointer border ${
          isStudentViewActive
            ? "bg-sky-100 text-sky-900 border-sky-300 font-bold shadow-xs"
            : "text-stone-700 hover:text-sky-800 hover:bg-sky-50 border-transparent font-semibold"
        }`}
        aria-current={isStudentViewActive ? "page" : undefined}
        title="Preview how students see the library"
      >
        <BookOpen className="w-4 h-4 text-sky-600" />
        <span>Student View</span>
        {isStudentViewActive && <span className="w-1.5 h-1.5 rounded-full bg-sky-600 ml-0.5" />}
      </Link>
    </nav>
  );
}

export function StudentNavLinks() {
  const pathname = usePathname();
  const isLibraryActive = pathname === "/student" || (pathname.startsWith("/student/resources") && pathname !== "/student/profile");
  const isProfileActive = pathname === "/student/profile";

  return (
    <nav className="flex items-center gap-2" aria-label="Student navigation">
      <Link
        href="/student"
        className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-sm transition-all duration-150 cursor-pointer ${
          isLibraryActive
            ? "bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold shadow-xs"
            : "text-stone-700 hover:text-emerald-800 hover:bg-emerald-50 font-semibold border border-transparent"
        }`}
        aria-current={isLibraryActive ? "page" : undefined}
      >
        <BookOpen className="w-4 h-4 text-emerald-700" />
        <span>Learning Library</span>
        {isLibraryActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 ml-0.5" />}
      </Link>

      <Link
        href="/student/profile"
        className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-sm transition-all duration-150 cursor-pointer ${
          isProfileActive
            ? "bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold shadow-xs"
            : "text-stone-700 hover:text-emerald-800 hover:bg-emerald-50 font-semibold border border-transparent"
        }`}
        aria-current={isProfileActive ? "page" : undefined}
      >
        <User className="w-4 h-4 text-emerald-700" />
        <span>My Profile</span>
        {isProfileActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 ml-0.5" />}
      </Link>
    </nav>
  );
}

export function GuestNavLinks() {
  const pathname = usePathname();
  const isLoginActive = pathname === "/login";
  const isRegisterActive = pathname === "/register";

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Link
        href="/login"
        className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
          isLoginActive
            ? "bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold shadow-xs"
            : "text-stone-700 hover:text-emerald-800 hover:bg-emerald-50"
        }`}
        aria-current={isLoginActive ? "page" : undefined}
      >
        Sign In
      </Link>
      <Link
        href="/register"
        className={`px-4 py-2 text-sm rounded-xl transition-all cursor-pointer ${
          isRegisterActive
            ? "bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold shadow-xs"
            : "bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs hover:scale-102"
        }`}
        aria-current={isRegisterActive ? "page" : undefined}
      >
        Student Register
      </Link>
    </div>
  );
}
