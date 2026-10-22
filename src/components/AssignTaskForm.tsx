"use client";

import React, { useState, useActionState, useRef } from "react";
import { createTaskAction, TaskActionResult } from "@/app/actions/tasks";
import { PlusCircle, CheckCircle, AlertCircle, Loader2, Calendar, Users, User, X, Paperclip, FileText } from "lucide-react";

interface StudentOption {
  id: string;
  name: string;
  grade: number;
}

export function AssignTaskForm({ students }: { students: StudentOption[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [targetType, setTargetType] = useState<"grade" | "student" | "all">("grade");
  const [targetGrade, setTargetGrade] = useState<number>(2);
  const [targetStudentId, setTargetStudentId] = useState<string>(students[0]?.id || "");
  const [chosenFileName, setChosenFileName] = useState<string | null>(null);

  const [state, formAction, isPending] = useActionState<TaskActionResult | null, FormData>(
    createTaskAction,
    null
  );

  const formRef = useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      setIsOpen(false);
    }
  }, [state]);

  return (
    <div>
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all hover:scale-102 cursor-pointer"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Assign New Task</span>
        </button>
      ) : (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xl space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div>
              <h3
                className="text-xl font-bold text-stone-900"
                style={{ fontFamily: "var(--font-fredoka)" }}
              >
                Assign Classroom Task 📋
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Assign a homework mission, reading log, or worksheet activity for students to complete.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {state?.error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          {state?.success && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{state.message}</span>
            </div>
          )}

          <form ref={formRef} action={formAction} className="space-y-5">
            {/* Task Title */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Task Title *
              </label>
              <input
                type="text"
                name="title"
                required
                placeholder="e.g. Read Chapter 2 & Draw your favorite character"
                className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>

            {/* Target Audience Selector */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Assign To *
              </label>
              <input type="hidden" name="targetType" value={targetType} />
              <input type="hidden" name="targetGrade" value={targetGrade} />
              <input type="hidden" name="targetStudentId" value={targetStudentId} />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setTargetType("grade")}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    targetType === "grade"
                      ? "bg-emerald-50 border-emerald-400 text-emerald-900 ring-2 ring-emerald-200"
                      : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Whole Grade</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetType("student")}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    targetType === "student"
                      ? "bg-emerald-50 border-emerald-400 text-emerald-900 ring-2 ring-emerald-200"
                      : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>Specific Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetType("all")}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    targetType === "all"
                      ? "bg-emerald-50 border-emerald-400 text-emerald-900 ring-2 ring-emerald-200"
                      : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>All Students (1–5)</span>
                </button>
              </div>

              {/* Specific Grade Picker */}
              {targetType === "grade" && (
                <div className="grid grid-cols-5 gap-2 p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200/80">
                  {[1, 2, 3, 4, 5].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setTargetGrade(g)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        targetGrade === g
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-white text-stone-700 hover:bg-stone-100"
                      }`}
                    >
                      Grade {g}
                    </button>
                  ))}
                </div>
              )}

              {/* Specific Student Dropdown */}
              {targetType === "student" && (
                <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200/80">
                  {students.length > 0 ? (
                    <select
                      value={targetStudentId}
                      onChange={(e) => setTargetStudentId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      {students.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name} (Grade {st.grade})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-xs text-stone-500 italic">No registered students found.</p>
                  )}
                </div>
              )}
            </div>

            {/* Task Description / Instructions */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Instructions / What to do *
              </label>
              <textarea
                name="description"
                rows={3}
                required
                placeholder="Give clear, step-by-step guidance for the student..."
                className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all resize-y"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Due Date (Optional)
              </label>
              <div className="relative max-w-xs">
                <Calendar className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  name="dueDate"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white cursor-pointer"
                />
              </div>
            </div>

            {/* Document / File Attachment */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Attach Worksheet or Document (Optional)
              </label>
              <div className="flex items-center gap-3 flex-wrap">
                <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-emerald-50 hover:border-emerald-300 text-stone-700 hover:text-emerald-800 text-xs font-semibold cursor-pointer transition-colors shadow-xs">
                  <Paperclip className="w-4 h-4 text-emerald-600" />
                  <span>{chosenFileName ? "Replace File" : "Upload Document / Worksheet (PDF, DOCX, Image)"}</span>
                  <input
                    type="file"
                    name="attachment"
                    onChange={(e) => setChosenFileName(e.target.files?.[0]?.name || null)}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.webp"
                    className="hidden"
                  />
                </label>
                {chosenFileName && (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    <FileText className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[200px]">{chosenFileName}</span>
                    <button
                      type="button"
                      onClick={() => setChosenFileName(null)}
                      className="ml-1 text-stone-400 hover:text-rose-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-stone-500 mt-1.5">
                Students will be able to view and download this file directly to complete their mission.
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Assigning Task...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Assign Task Now</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
