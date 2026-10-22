"use client";

import React, { useState, useActionState } from "react";
import Link from "next/link";
import { loginAction, AuthActionResult } from "@/app/actions/auth";
import { SproutIcon, OwlIcon } from "@/components/GardenIcons";
import { Lock, Mail, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export function LoginForm({
  initialRole = "student",
  errorParam,
}: {
  initialRole?: string;
  errorParam?: string;
}) {
  const [roleTab, setRoleTab] = useState<"student" | "teacher">(
    initialRole === "teacher" ? "teacher" : "student"
  );

  const [state, formAction, isPending] = useActionState<AuthActionResult | null, FormData>(
    loginAction,
    null
  );

  // If redirecting after success
  React.useEffect(() => {
    if (state?.success && state.redirectTo) {
      window.location.href = state.redirectTo;
    }
  }, [state]);

  const errorMessage =
    state?.error ||
    (errorParam === "account_inactive"
      ? "Your student account is currently paused. Please ask your teacher to reactivate it."
      : null);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-xl max-w-md w-full mx-auto">
      {/* Role Tabs */}
      <div className="flex p-1 bg-stone-100 rounded-2xl mb-8">
        <button
          type="button"
          onClick={() => setRoleTab("student")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            roleTab === "student"
              ? "bg-white text-emerald-800 shadow-xs"
              : "text-stone-500 hover:text-stone-800"
          }`}
        >
          <SproutIcon className="w-4 h-4 text-emerald-600" />
          <span>Student Garden</span>
        </button>
        <button
          type="button"
          onClick={() => setRoleTab("teacher")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            roleTab === "teacher"
              ? "bg-white text-amber-800 shadow-xs"
              : "text-stone-500 hover:text-stone-800"
          }`}
        >
          <OwlIcon className="w-4 h-4 text-amber-600" />
          <span>Teacher Desk</span>
        </button>
      </div>

      <div className="text-center mb-6">
        <h2
          className="text-2xl font-bold text-stone-900"
          style={{ fontFamily: "var(--font-fredoka)" }}
        >
          {roleTab === "student" ? "Welcome Back, Little Explorer! 🌱" : "Teacher Desk Sign In 🍎"}
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          {roleTab === "student"
            ? "Sign in to open your grade's worksheets and stories."
            : "Sign in to manage curriculum materials and review students."}
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 mb-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
            {roleTab === "student" ? "Username or Student Email" : "Teacher Email"}
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="identifier"
              required
              placeholder={roleTab === "student" ? "e.g. your username or student email" : "e.g. teacher@school.edu"}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-6 disabled:opacity-70"
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span>Sign In to {roleTab === "student" ? "Garden" : "Teacher Desk"}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Student Registration Prompt */}
      {roleTab === "student" && (
        <div className="mt-8 pt-6 border-t border-stone-100 text-center text-xs text-stone-600">
          <span>New student in Grades 1–5? </span>
          <Link
            href="/register"
            className="font-bold text-emerald-700 hover:underline inline-flex items-center gap-0.5"
          >
            Create your Student Pass
          </Link>
        </div>
      )}

      {/* Teacher Note */}
      {roleTab === "teacher" && (
        <div className="mt-8 pt-6 border-t border-stone-100 text-center text-xs text-stone-500">
          Teacher credentials are protected and cannot be self-registered publicly.
        </div>
      )}
    </div>
  );
}
