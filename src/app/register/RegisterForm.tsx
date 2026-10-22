"use client";

import React, { useState, useActionState } from "react";
import Link from "next/link";
import { registerStudentAction, AuthActionResult } from "@/app/actions/auth";
import { SproutIcon, BeeIcon, OwlIcon } from "@/components/GardenIcons";
import { User, Lock, Mail, ArrowRight, Loader2, AlertCircle, CheckCircle } from "lucide-react";

const AVATARS = [
  { id: "sprout", label: "Sprout 🌱", icon: <SproutIcon className="w-5 h-5 text-emerald-600" /> },
  { id: "bee", label: "Little Bee 🐝", icon: <BeeIcon className="w-5 h-5 text-amber-500" /> },
  { id: "owl", label: "Wise Owl 🦉", icon: <OwlIcon className="w-5 h-5 text-amber-700" /> },
];

export function RegisterForm() {
  const [selectedGrade, setSelectedGrade] = useState<number>(2);
  const [selectedAvatar, setSelectedAvatar] = useState<string>("sprout");

  const [state, formAction, isPending] = useActionState<AuthActionResult | null, FormData>(
    registerStudentAction,
    null
  );

  React.useEffect(() => {
    if (state?.success && state.redirectTo) {
      window.location.href = state.redirectTo;
    }
  }, [state]);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-xl max-w-lg w-full mx-auto">
      <div className="text-center mb-6">
        <h2
          className="text-2xl sm:text-3xl font-bold text-stone-900"
          style={{ fontFamily: "var(--font-fredoka)" }}
        >
          Join Bright English Garden! 🎒
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Create your free student learning pass for Grades 1–5.
        </p>
      </div>

      {state?.error && (
        <div className="p-3.5 mb-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <p>{state.error}</p>
        </div>
      )}

      <form action={formAction} className="space-y-5">
        {/* Student Name */}
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
            Student First & Last Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Leo Parker"
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Grade Selection */}
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
            Select Your Primary Grade (1 to 5)
          </label>
          <input type="hidden" name="grade" value={selectedGrade} />
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGrade(g)}
                className={`py-3 px-2 rounded-2xl font-bold text-center text-sm transition-all cursor-pointer border ${
                  selectedGrade === g
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-md scale-105"
                    : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                }`}
              >
                Grade {g}
              </button>
            ))}
          </div>
        </div>

        {/* Mascot Avatar Selection */}
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
            Pick Your Garden Mascot
          </label>
          <input type="hidden" name="avatar" value={selectedAvatar} />
          <div className="grid grid-cols-3 gap-2.5">
            {AVATARS.map((av) => (
              <button
                key={av.id}
                type="button"
                onClick={() => setSelectedAvatar(av.id)}
                className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                  selectedAvatar === av.id
                    ? "bg-emerald-50 text-emerald-800 border-emerald-400 shadow-xs ring-2 ring-emerald-500"
                    : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                }`}
              >
                {av.icon}
                <span className="hidden sm:inline">{av.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Student Username or Email */}
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
            Student Username or Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="identifier"
              required
              placeholder="e.g. leo2026 or leo@garden.edu"
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <p className="text-[11px] text-stone-400 mt-1">
            You will use this username to sign in anytime.
          </p>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
            Create a Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              name="password"
              required
              minLength={6}
              placeholder="At least 6 characters"
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-4 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-4 disabled:opacity-70"
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span>Plant My Garden Pass 🌱</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-stone-100 text-center text-xs text-stone-600">
        <span>Already have an account? </span>
        <Link href="/login" className="font-bold text-emerald-700 hover:underline">
          Sign In here
        </Link>
      </div>
    </div>
  );
}
