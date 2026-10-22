"use client";

import React, { useState, useTransition } from "react";
import {
  toggleStudentStatusAction,
  updateStudentGradePermissionsAction,
} from "@/app/actions/students";
import {
  UserCheck,
  UserX,
  Loader2,
  ShieldCheck,
  Settings2,
  X,
  Check,
  Sparkles,
} from "lucide-react";
import { UserAvatar } from "./UserAvatar";

export interface StudentProps {
  id: string;
  name: string;
  email: string;
  grade: number;
  avatar?: string;
  status: "active" | "inactive";
  accessAllGrades?: boolean;
  allowedGrades?: number[];
  createdAt: string;
}

export function StudentRow({ student }: { student: StudentProps }) {
  const [isPendingStatus, startStatusTransition] = useTransition();
  const [isPendingPerms, startPermsTransition] = useTransition();

  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  const [accessAll, setAccessAll] = useState(Boolean(student.accessAllGrades));
  const [selectedGrades, setSelectedGrades] = useState<number[]>(
    student.allowedGrades || []
  );

  const handleToggleStatus = () => {
    const nextStatus = student.status === "active" ? "inactive" : "active";
    startStatusTransition(async () => {
      await toggleStudentStatusAction(student.id, nextStatus);
    });
  };

  const handleToggleGradeCheck = (gradeNum: number) => {
    if (selectedGrades.includes(gradeNum)) {
      setSelectedGrades(selectedGrades.filter((g) => g !== gradeNum));
    } else {
      setSelectedGrades([...selectedGrades, gradeNum].sort());
    }
  };

  const handleSavePermissions = () => {
    startPermsTransition(async () => {
      await updateStudentGradePermissionsAction(student.id, accessAll, selectedGrades);
      setIsPermModalOpen(false);
    });
  };

  const isActive = student.status === "active";

  // Determine what permission label to show
  const hasAllGrades = student.accessAllGrades;
  const extraGrades = student.allowedGrades || [];

  return (
    <>
      <tr className="hover:bg-stone-50/80 transition-colors">
        {/* Student Name & Avatar */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-3">
            <UserAvatar avatar={student.avatar} name={student.name} size="md" />
            <div>
              <div
                className="text-sm font-bold text-stone-900"
                style={{ fontFamily: "var(--font-fredoka)" }}
              >
                {student.name}
              </div>
              <div className="text-xs text-stone-500">{student.email}</div>
            </div>
          </div>
        </td>

        {/* Primary Enrolled Grade */}
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            Grade {student.grade}
          </span>
        </td>

        {/* Grade Permissions Granted */}
        <td className="px-6 py-4 whitespace-nowrap">
          {hasAllGrades ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-200">
              <Sparkles className="w-3 h-3 text-purple-600" />
              <span>All Grades (1–5)</span>
            </span>
          ) : extraGrades.length > 0 ? (
            <div className="flex items-center gap-1 flex-wrap">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-800 border border-stone-200">
                Grade {student.grade}
              </span>
              <span className="text-xs text-stone-400">+</span>
              {extraGrades.map((g) => (
                <span
                  key={g}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200"
                >
                  Grade {g}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-xs text-stone-500 italic">Grade {student.grade} only</span>
          )}
        </td>

        {/* Status */}
        <td className="px-6 py-4 whitespace-nowrap">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
              isActive
                ? "bg-emerald-100 text-emerald-800"
                : "bg-rose-100 text-rose-800"
            }`}
          >
            {isActive ? "Active" : "Paused"}
          </span>
        </td>

        {/* Actions */}
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
          <div className="flex items-center justify-end gap-2">
            {/* Manage Grade Permissions Button */}
            <button
              type="button"
              onClick={() => {
                setAccessAll(Boolean(student.accessAllGrades));
                setSelectedGrades(student.allowedGrades || []);
                setIsPermModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
              title="Configure which grades this student can access"
            >
              <Settings2 className="w-3.5 h-3.5 text-amber-700" />
              <span>Grade Access</span>
            </button>

            {/* Toggle Status Button */}
            <button
              type="button"
              onClick={handleToggleStatus}
              disabled={isPendingStatus}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                isActive
                  ? "border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100"
                  : "border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
              }`}
            >
              {isPendingStatus ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isActive ? (
                <UserX className="w-3.5 h-3.5" />
              ) : (
                <UserCheck className="w-3.5 h-3.5" />
              )}
              <span>{isActive ? "Deactivate" : "Activate"}</span>
            </button>
          </div>
        </td>
      </tr>

      {/* Permissions Configuration Modal */}
      {isPermModalOpen && (
        <tr>
          <td colSpan={5} className="p-0">
            <div
              role="dialog"
              aria-modal="true"
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in"
            >
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6">
                {/* Modal Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4
                        className="text-lg font-bold text-stone-900"
                        style={{ fontFamily: "var(--font-fredoka)" }}
                      >
                        Grade Access Permissions
                      </h4>
                      <p className="text-xs text-stone-500">
                        Configuring for: <strong>{student.name}</strong> (Enrolled in Grade {student.grade})
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPermModalOpen(false)}
                    className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Explanation */}
                <p className="text-xs text-stone-600 bg-stone-50 p-3.5 rounded-2xl border border-stone-200 leading-relaxed">
                  By default, students can <strong>only view materials for their enrolled grade</strong> (Grade {student.grade}).
                  Use the checkboxes below to unlock extra grades or grant full access.
                </p>

                {/* All Grades Master Toggle */}
                <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-purple-950 block">
                      Grant Access to ALL Grades (1 through 5)
                    </span>
                    <span className="text-[11px] text-purple-700">
                      Student will be able to browse materials across the entire school library.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    id={`all-grades-${student.id}`}
                    checked={accessAll}
                    onChange={(e) => setAccessAll(e.target.checked)}
                    className="w-5 h-5 accent-purple-600 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Individual Grade Checkboxes */}
                <div className={accessAll ? "opacity-40 pointer-events-none" : ""}>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    Or Select Specific Permitted Grades:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[1, 2, 3, 4, 5].map((g) => {
                      const isEnrolled = g === student.grade;
                      const isChecked = isEnrolled || selectedGrades.includes(g) || accessAll;

                      return (
                        <label
                          key={g}
                          className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                            isChecked
                              ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold"
                              : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              disabled={isEnrolled || accessAll}
                              checked={isChecked}
                              onChange={() => handleToggleGradeCheck(g)}
                              className="w-4 h-4 accent-emerald-600 rounded-md cursor-pointer"
                            />
                            <span className="text-xs">
                              Grade {g} {isEnrolled && "(Enrolled Primary)"}
                            </span>
                          </div>
                          {isChecked && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setIsPermModalOpen(false)}
                    disabled={isPendingPerms}
                    className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 font-semibold text-xs hover:bg-stone-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePermissions}
                    disabled={isPendingPerms}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    {isPendingPerms && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{isPendingPerms ? "Saving..." : "Save Grade Permissions"}</span>
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
