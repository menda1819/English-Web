"use client";

import React, { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, Lock } from "lucide-react";

export const TOPICS = [
  "Phonics & Alphabet",
  "Grammar & Punctuation",
  "Reading Comprehension",
  "Vocabulary & Spelling",
  "Creative Writing",
  "Poetry & Rhymes",
  "Speaking & Listening",
];

export const RESOURCE_TYPES = [
  { value: "worksheet", label: "Worksheet" },
  { value: "lesson-plan", label: "Lesson Plan" },
  { value: "notes", label: "Notes & Guides" },
  { value: "exam-paper", label: "Exam Paper" },
  { value: "revision", label: "Revision Material" },
  { value: "activity", label: "Fun Activity" },
  { value: "document", label: "Document" },
];

export function ResourceFilters({
  isTeacher = false,
  studentGrade,
  permittedGrades = [1, 2, 3, 4, 5],
  accessAllGrades = false,
}: {
  isTeacher?: boolean;
  studentGrade?: number;
  permittedGrades?: number[];
  accessAllGrades?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("q") || "";
  const currentGrade = searchParams.get("grade") || "";
  const currentTopic = searchParams.get("topic") || "";
  const currentType = searchParams.get("type") || "";
  const currentStatus = searchParams.get("status") || "";
  const currentSort = searchParams.get("sort") || "newest";

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const clearAllFilters = () => {
    startTransition(() => {
      router.replace(pathname);
    });
  };

  const hasActiveFilters = Boolean(
    currentSearch || currentGrade || currentTopic || currentType || currentStatus
  );

  // Available grades for this viewer:
  // If teacher or has all-grades permission: 1 to 5
  // Otherwise: strictly permittedGrades
  const canAccessAll = isTeacher || accessAllGrades;
  const visibleGrades = canAccessAll ? [1, 2, 3, 4, 5] : permittedGrades;

  return (
    <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xs mb-8 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          placeholder="Search by title, topic, or keyword..."
          defaultValue={currentSearch}
          onChange={(e) => updateParam("q", e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm font-medium transition-all"
        />
        {currentSearch && (
          <button
            type="button"
            onClick={() => updateParam("q", "")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Grade Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs">
          <span className="font-bold text-stone-500 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Grade:
          </span>

          {/* Show 'All' button if user has permission to more than 1 grade */}
          {visibleGrades.length > 1 && (
            <button
              type="button"
              onClick={() => updateParam("grade", "")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                !currentGrade
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              All Permitted
            </button>
          )}

          {/* Permitted Grade Buttons */}
          {visibleGrades.map((g) => {
            const isSelected = currentGrade === g.toString();
            const isStudentEnrolledGrade = studentGrade === g;
            return (
              <button
                key={g}
                type="button"
                onClick={() => updateParam("grade", isSelected ? "" : g.toString())}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer relative ${
                  isSelected
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                Grade {g}
                {isStudentEnrolledGrade && (
                  <span className="ml-1 text-[10px] text-amber-300 font-extrabold" title="Your enrolled grade">★</span>
                )}
              </button>
            );
          })}

          {/* Note if student has locked grades */}
          {!canAccessAll && visibleGrades.length < 5 && (
            <span
              className="inline-flex items-center gap-1 text-[11px] text-stone-400 bg-stone-50 px-2.5 py-1 rounded-xl border border-stone-200/80 ml-1"
              title="Speak with your teacher if you need access to materials in other grades"
            >
              <Lock className="w-3 h-3 text-stone-400" />
              <span>Other grades locked</span>
            </span>
          )}
        </div>

        {/* Topic Dropdown */}
        <div className="flex items-center gap-2 ml-auto">
          <select
            value={currentTopic}
            onChange={(e) => updateParam("topic", e.target.value)}
            className="text-xs font-semibold py-2 px-3 rounded-xl bg-stone-100 border border-stone-200 text-stone-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="">All Topics</option>
            {TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>

          {/* Type Dropdown */}
          <select
            value={currentType}
            onChange={(e) => updateParam("type", e.target.value)}
            className="text-xs font-semibold py-2 px-3 rounded-xl bg-stone-100 border border-stone-200 text-stone-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="">All Types</option>
            {RESOURCE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          {/* Teacher Status Filter */}
          {isTeacher && (
            <select
              value={currentStatus}
              onChange={(e) => updateParam("status", e.target.value)}
              className="text-xs font-semibold py-2 px-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
          )}

          {/* Sort Dropdown */}
          <select
            value={currentSort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="text-xs font-semibold py-2 px-3 rounded-xl bg-stone-100 border border-stone-200 text-stone-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title (A-Z)</option>
          </select>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
