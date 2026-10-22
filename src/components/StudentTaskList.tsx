"use client";

import React, { useState, useTransition } from "react";
import { toggleStudentTaskDoneAction } from "@/app/actions/tasks";
import {
  CheckCircle,
  Calendar,
  Clock,
  Sparkles,
  Check,
  Star,
  Loader2,
  BookOpen,
  MessageSquare,
  Award,
  Paperclip,
  FileText,
  X,
} from "lucide-react";

export interface StudentTaskViewItem {
  id: string;
  title: string;
  description: string;
  targetType: "grade" | "student" | "all";
  targetGrade?: number;
  dueDate?: string;
  teacherName: string;
  attachmentName?: string;
  attachmentSize?: number;
  attachmentMimeType?: string;
  createdAt: string;
  mySubmission?: {
    status: "done" | "reviewed";
    submittedAt: string;
    studentNote?: string;
    attachmentName?: string;
    attachmentSize?: number;
    attachmentMimeType?: string;
    teacherFeedback?: string;
    teacherRating?: string;
    reviewedAt?: string;
  };
}

export function StudentTaskList({ tasks }: { tasks: StudentTaskViewItem[] }) {
  const [activeTab, setActiveTab] = useState<"todo" | "completed">("todo");

  const todoTasks = tasks.filter((t) => !t.mySubmission);
  const completedTasks = tasks.filter((t) => Boolean(t.mySubmission));

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex items-center gap-3 border-b border-stone-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("todo")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "todo"
              ? "bg-emerald-600 text-white shadow-md scale-102"
              : "bg-white text-stone-700 hover:bg-stone-50 border border-stone-200"
          }`}
        >
          <span>To Do Missions</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
              activeTab === "todo"
                ? "bg-white/20 text-white"
                : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {todoTasks.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("completed")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "completed"
              ? "bg-emerald-600 text-white shadow-md scale-102"
              : "bg-white text-stone-700 hover:bg-stone-50 border border-stone-200"
          }`}
        >
          <span>Completed & Feedback</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
              activeTab === "completed"
                ? "bg-white/20 text-white"
                : "bg-stone-100 text-stone-700"
            }`}
          >
            {completedTasks.length}
          </span>
        </button>
      </div>

      {/* Tab 1: TO DO TASKS */}
      {activeTab === "todo" && (
        <div className="space-y-4">
          {todoTasks.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-stone-200 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4
                className="text-xl font-bold text-stone-800"
                style={{ fontFamily: "var(--font-fredoka)" }}
              >
                All Caught Up! 🎉
              </h4>
              <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto">
                You have completed all your assigned English tasks. Explore the Learning Library for more stories and fun worksheets!
              </p>
            </div>
          ) : (
            todoTasks.map((task) => (
              <StudentTodoCard key={task.id} task={task} />
            ))
          )}
        </div>
      )}

      {/* Tab 2: COMPLETED & TEACHER FEEDBACK */}
      {activeTab === "completed" && (
        <div className="space-y-4">
          {completedTasks.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-stone-200 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-8 h-8" />
              </div>
              <h4
                className="text-xl font-bold text-stone-800"
                style={{ fontFamily: "var(--font-fredoka)" }}
              >
                No completed tasks yet
              </h4>
              <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto">
                When you tick tasks as done from your "To Do" list, they will appear here along with your teacher's stars and feedback!
              </p>
            </div>
          ) : (
            completedTasks.map((task) => (
              <StudentCompletedCard key={task.id} task={task} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function StudentTodoCard({ task }: { task: StudentTaskViewItem }) {
  const [studentNote, setStudentNote] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleTickDone = () => {
    startTransition(async () => {
      const fd = new FormData();
      if (studentNote) fd.append("studentNote", studentNote);
      if (uploadedFile) fd.append("attachment", uploadedFile);
      await toggleStudentTaskDoneAction(task.id, fd);
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm hover:border-emerald-300 transition-all space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>Assigned Task</span>
            </span>

            {task.dueDate && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600">
                <Calendar className="w-3 h-3 text-stone-400" />
                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
              </span>
            )}
          </div>

          <h4
            className="text-xl font-bold text-stone-900"
            style={{ fontFamily: "var(--font-fredoka)" }}
          >
            {task.title}
          </h4>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal whitespace-pre-line">
            {task.description}
          </p>

          {/* Teacher Worksheet / Material Download Link */}
          {task.attachmentName && (
            <div className="pt-1">
              <a
                href={`/api/tasks/${task.id}/file?type=task`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              >
                <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                <span>Teacher Attachment: {task.attachmentName}</span>
                {task.attachmentSize && (
                  <span className="text-[10px] text-emerald-600 font-normal">
                    ({(task.attachmentSize / 1024).toFixed(1)} KB)
                  </span>
                )}
              </a>
            </div>
          )}

          <p className="text-[11px] text-stone-400 italic">
            Assigned by Teacher {task.teacherName}
          </p>
        </div>

        {/* Big Tick As Done Button */}
        <div className="shrink-0 flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={handleTickDone}
            disabled={isPending}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Ticking Done...</span>
              </>
            ) : (
              <>
                <Check className="w-5 h-5 stroke-[3]" />
                <span>Tick as Done! 🎒</span>
              </>
            )}
          </button>

          {!showOptions && (
            <button
              type="button"
              onClick={() => setShowOptions(true)}
              className="text-xs text-stone-500 hover:text-emerald-700 underline cursor-pointer"
            >
              + Attach work file or add a note
            </button>
          )}
        </div>
      </div>

      {/* Student Work Attachment & Note Drawer */}
      {showOptions && (
        <div className="pt-3 border-t border-stone-100 space-y-3 bg-stone-50/60 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-700">Attach Completed Work & Note (Optional):</span>
            <button
              type="button"
              onClick={() => setShowOptions(false)}
              className="text-stone-400 hover:text-stone-700 text-xs"
            >
              Close
            </button>
          </div>

          {/* File Upload for Student */}
          <div className="flex items-center gap-2 flex-wrap">
            <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-stone-200 hover:bg-emerald-50 hover:border-emerald-300 text-stone-700 hover:text-emerald-800 text-xs font-semibold cursor-pointer transition-colors shadow-2xs">
              <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
              <span>{uploadedFile ? "Replace File" : "Attach Work (PDF, Word, or Photo)"}</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.webp"
                onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>

            {uploadedFile && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span className="truncate max-w-[200px]">{uploadedFile.name}</span>
                <button
                  type="button"
                  onClick={() => setUploadedFile(null)}
                  className="ml-1 text-stone-400 hover:text-rose-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Note Input */}
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-stone-400 shrink-0" />
            <input
              type="text"
              value={studentNote}
              onChange={(e) => setStudentNote(e.target.value)}
              placeholder="e.g. 'I finished question 5 and drew the castle!'"
              className="flex-1 px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StudentCompletedCard({ task }: { task: StudentTaskViewItem }) {
  const sub = task.mySubmission!;
  const hasFeedback = Boolean(sub.teacherFeedback);

  return (
    <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
              <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
              <span>Completed</span>
            </span>

            <span className="text-xs text-stone-500">
              Done on {new Date(sub.submittedAt).toLocaleDateString()}
            </span>
          </div>

          <h4
            className="text-lg font-bold text-stone-900 mt-2"
            style={{ fontFamily: "var(--font-fredoka)" }}
          >
            {task.title}
          </h4>

          <p className="text-xs text-stone-600 line-clamp-2">
            {task.description}
          </p>

          {/* Teacher Worksheet link if task had one */}
          {task.attachmentName && (
            <div className="pt-1">
              <a
                href={`/api/tasks/${task.id}/file?type=task`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-900 font-semibold underline"
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>Teacher Attachment: {task.attachmentName}</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Student Uploaded Work File */}
      {sub.attachmentName && (
        <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-600 shrink-0" />
            <div>
              <span className="font-bold text-sky-950 block">Your Uploaded Work File:</span>
              <span className="text-stone-600 font-medium">{sub.attachmentName}</span>
            </div>
          </div>
          <a
            href={`/api/tasks/${task.id}/file?type=submission`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
          >
            View File 📄
          </a>
        </div>
      )}

      {/* Student Note if present */}
      {sub.studentNote && (
        <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-700">
          <span className="font-bold text-stone-900 block mb-0.5">Your Note:</span>
          <p className="italic">"{sub.studentNote}"</p>
        </div>
      )}

      {/* Teacher Feedback & Star Rating */}
      {hasFeedback ? (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-emerald-50 border-2 border-amber-300 shadow-xs space-y-2.5 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-amber-100 text-amber-700">
                <Award className="w-4 h-4" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-900">
                Teacher {task.teacherName}'s Feedback
              </span>
            </div>

            {sub.teacherRating && (
              <span className="px-3 py-1 rounded-full bg-white text-xs font-extrabold text-amber-800 border border-amber-200 shadow-xs">
                {sub.teacherRating}
              </span>
            )}
          </div>

          <p className="text-sm font-semibold text-stone-800 italic bg-white/70 p-3.5 rounded-xl border border-amber-200/80 leading-relaxed">
            "{sub.teacherFeedback}"
          </p>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Teacher {task.teacherName} received your work and will review it soon! Check back here for your feedback and stars! ⭐
          </span>
        </div>
      )}
    </div>
  );
}
