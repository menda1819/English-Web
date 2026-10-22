"use client";

import React, { useState, useTransition } from "react";
import { reviewTaskSubmissionAction, deleteTaskAction } from "@/app/actions/tasks";
import { UserAvatar } from "./UserAvatar";
import {
  Bell,
  CheckCircle,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Trash2,
  Loader2,
  Calendar,
  Users,
  User,
  Star,
  Send,
  Check,
  Paperclip,
  FileText,
} from "lucide-react";

export interface TaskSubmissionItem {
  studentId: string;
  studentName: string;
  studentGrade: number;
  studentAvatar?: string;
  status: "done" | "reviewed";
  submittedAt: string;
  studentNote?: string;
  attachmentName?: string;
  attachmentSize?: number;
  attachmentMimeType?: string;
  teacherFeedback?: string;
  teacherRating?: string;
  reviewedAt?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  targetType: "grade" | "student" | "all";
  targetGrade?: number;
  targetStudentName?: string;
  dueDate?: string;
  attachmentName?: string;
  attachmentSize?: number;
  attachmentMimeType?: string;
  createdAt: string;
  submissions: TaskSubmissionItem[];
}

const RATING_OPTIONS = [
  "⭐⭐⭐ Outstanding!",
  "⭐⭐ Great Job",
  "⭐ Good Effort",
  "🏆 Champion Work",
  "💖 Wonderful Practice",
];

export function TeacherTaskList({ tasks }: { tasks: TaskItem[] }) {
  const [filter, setFilter] = useState<string>("all");
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (filter === "needs_review") {
      return t.submissions.some((s) => s.status === "done" && !s.teacherFeedback);
    }
    if (filter.startsWith("grade_")) {
      const g = parseInt(filter.replace("grade_", ""), 10);
      return t.targetGrade === g;
    }
    return true;
  });

  const totalNeedsReview = tasks.reduce((acc, t) => {
    return acc + t.submissions.filter((s) => s.status === "done" && !s.teacherFeedback).length;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            filter === "all"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-white text-stone-700 hover:bg-stone-50 border border-stone-200"
          }`}
        >
          All Tasks ({tasks.length})
        </button>

        <button
          type="button"
          onClick={() => setFilter("needs_review")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            filter === "needs_review"
              ? "bg-rose-600 text-white shadow-xs"
              : totalNeedsReview > 0
              ? "bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100 font-extrabold"
              : "bg-white text-stone-700 hover:bg-stone-50 border border-stone-200"
          }`}
        >
          <Bell className={`w-3.5 h-3.5 ${totalNeedsReview > 0 ? "animate-bounce text-rose-600" : ""}`} />
          <span>Needs Review ({totalNeedsReview})</span>
        </button>

        {[1, 2, 3, 4, 5].map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setFilter(`grade_${g}`)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filter === `grade_${g}`
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white text-stone-700 hover:bg-stone-50 border border-stone-200"
            }`}
          >
            Grade {g}
          </button>
        ))}
      </div>

      {/* Task Cards List */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-stone-200 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h4
            className="text-lg font-bold text-stone-800"
            style={{ fontFamily: "var(--font-fredoka)" }}
          >
            No tasks found in this view
          </h4>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {filter === "needs_review"
              ? "Great job! All student submissions have been reviewed and rewarded with feedback."
              : "Click 'Assign New Task' above to send a new homework or reading mission to your students."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <TeacherTaskCard
              key={task.id}
              task={task}
              isExpanded={expandedTaskId === task.id}
              onToggleExpand={() =>
                setExpandedTaskId(expandedTaskId === task.id ? null : task.id)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TeacherTaskCard({
  task,
  isExpanded,
  onToggleExpand,
}: {
  task: TaskItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const [isPendingDelete, startDeleteTransition] = useTransition();

  const pendingReviewCount = task.submissions.filter(
    (s) => s.status === "done" && !s.teacherFeedback
  ).length;

  const reviewedCount = task.submissions.filter((s) => s.teacherFeedback).length;

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete the task "${task.title}"?`)) {
      startDeleteTransition(async () => {
        await deleteTaskAction(task.id);
      });
    }
  };

  return (
    <div
      className={`bg-white rounded-3xl border transition-all ${
        pendingReviewCount > 0
          ? "border-rose-300 shadow-md ring-1 ring-rose-200"
          : "border-stone-200 shadow-xs hover:border-emerald-200"
      }`}
    >
      {/* Task Summary Header */}
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Audience Pill */}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {task.targetType === "grade" ? (
                  <>
                    <Users className="w-3 h-3 text-emerald-600" />
                    <span>Grade {task.targetGrade}</span>
                  </>
                ) : task.targetType === "student" ? (
                  <>
                    <User className="w-3 h-3 text-emerald-600" />
                    <span>Student: {task.targetStudentName}</span>
                  </>
                ) : (
                  <>
                    <Users className="w-3 h-3 text-emerald-600" />
                    <span>All Grades (1–5)</span>
                  </>
                )}
              </span>

              {/* Due Date Pill */}
              {task.dueDate && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600">
                  <Calendar className="w-3 h-3 text-stone-400" />
                  <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                </span>
              )}

              {/* Notification Label for Teacher */}
              {pendingReviewCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-extrabold bg-rose-500 text-white shadow-xs animate-pulse">
                  <Bell className="w-3.5 h-3.5" />
                  <span>{pendingReviewCount} Needs Review!</span>
                </span>
              )}
            </div>

            <h4
              className="text-lg font-bold text-stone-900"
              style={{ fontFamily: "var(--font-fredoka)" }}
            >
              {task.title}
            </h4>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-3xl">
              {task.description}
            </p>

            {task.attachmentName && (
              <div className="pt-1">
                <a
                  href={`/api/tasks/${task.id}/file?type=task`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                >
                  <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Task Material: {task.attachmentName}</span>
                  {task.attachmentSize && (
                    <span className="text-[10px] text-emerald-600 font-normal">
                      ({(task.attachmentSize / 1024).toFixed(1)} KB)
                    </span>
                  )}
                </a>
              </div>
            )}
          </div>

          {/* Action buttons & Submission count */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
            <div className="text-right">
              <span className="text-xs font-bold text-stone-800 block">
                {task.submissions.length} Submissions
              </span>
              <span className="text-[11px] text-stone-500">
                {reviewedCount} reviewed • {pendingReviewCount} pending
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPendingDelete}
                className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                title="Delete Task"
              >
                {isPendingDelete ? (
                  <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>

              <button
                type="button"
                onClick={onToggleExpand}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  pendingReviewCount > 0
                    ? "bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300"
                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200"
                }`}
              >
                <span>{isExpanded ? "Hide Submissions" : "View Submissions"}</span>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Submissions Drawer */}
      {isExpanded && (
        <div className="border-t border-stone-100 p-5 sm:p-6 bg-stone-50/70 rounded-b-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Student Work & Teacher Feedback</span>
            </h5>
            <span className="text-xs text-stone-500 font-medium">
              {task.submissions.length} student(s) completed this mission
            </span>
          </div>

          {task.submissions.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white border border-stone-200 text-center text-xs text-stone-500">
              No students have completed this task yet. When students tick it as done, their submissions will appear here for your review! 🎒
            </div>
          ) : (
            <div className="space-y-3">
              {task.submissions.map((sub) => (
                <SubmissionReviewCard
                  key={sub.studentId}
                  taskId={task.id}
                  submission={sub}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SubmissionReviewCard({
  taskId,
  submission,
}: {
  taskId: string;
  submission: TaskSubmissionItem;
}) {
  const [isEditing, setIsEditing] = useState(!submission.teacherFeedback);
  const [feedback, setFeedback] = useState(submission.teacherFeedback || "");
  const [rating, setRating] = useState(submission.teacherRating || RATING_OPTIONS[0]);
  const [isPending, startTransition] = useTransition();
  const [successToast, setSuccessToast] = useState(false);

  const handleSaveFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    startTransition(async () => {
      const res = await reviewTaskSubmissionAction(taskId, submission.studentId, feedback, rating);
      if (res.success) {
        setIsEditing(false);
        setSuccessToast(true);
        setTimeout(() => setSuccessToast(false), 3000);
      }
    });
  };

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl bg-white border transition-all ${
        !submission.teacherFeedback
          ? "border-rose-300 ring-2 ring-rose-100 shadow-sm"
          : "border-stone-200"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <UserAvatar avatar={submission.studentAvatar} name={submission.studentName} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-sm font-bold text-stone-900"
                style={{ fontFamily: "var(--font-fredoka)" }}
              >
                {submission.studentName}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Grade {submission.studentGrade}
              </span>
            </div>
            <span className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3 text-stone-400" />
              <span>Completed on {new Date(submission.submittedAt).toLocaleDateString()} at {new Date(submission.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </span>
          </div>
        </div>

        {/* Status Label */}
        <div>
          {!submission.teacherFeedback ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
              <Bell className="w-3.5 h-3.5 text-rose-600 animate-bounce" />
              <span>Needs Your Feedback!</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Reviewed ({submission.teacherRating})</span>
            </span>
          )}
        </div>
      </div>

      {/* Student Note */}
      {submission.studentNote && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs">
          <span className="font-bold text-amber-900 block mb-0.5">Student Note:</span>
          <p className="text-stone-700 italic">"{submission.studentNote}"</p>
        </div>
      )}

      {/* Student Uploaded Work Document / Photo */}
      {submission.attachmentName && (
        <div className="mb-4 p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sky-950 block">Student Uploaded Work File:</span>
              <span className="text-stone-600 font-medium">
                {submission.attachmentName}
                {submission.attachmentSize && (
                  <span className="text-stone-400 text-[11px] ml-1">
                    ({(submission.attachmentSize / 1024).toFixed(1)} KB)
                  </span>
                )}
              </span>
            </div>
          </div>
          <a
            href={`/api/tasks/${taskId}/file?type=submission&studentId=${submission.studentId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0 w-fit cursor-pointer"
          >
            <span>View / Download Student File 📄</span>
          </a>
        </div>
      )}

      {/* Teacher Feedback Display vs Edit Form */}
      {!isEditing && submission.teacherFeedback ? (
        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Your Feedback to {submission.studentName}:</span>
            </span>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
            >
              Edit Feedback
            </button>
          </div>
          <p className="text-xs text-stone-800 leading-relaxed font-medium">
            "{submission.teacherFeedback}"
          </p>
          <div className="text-[11px] text-emerald-800 font-bold">
            Rating Sticker: <span className="text-amber-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200 ml-1">{submission.teacherRating}</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSaveFeedback} className="space-y-3 pt-1">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              Choose Praise Sticker / Rating:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {RATING_OPTIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRating(r)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    rating === r
                      ? "bg-amber-100 text-amber-900 border border-amber-400 ring-2 ring-amber-200"
                      : "bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Encouraging Feedback:
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              required
              rows={2}
              placeholder={`Write encouraging feedback for ${submission.studentName} (e.g. "Fantastic vocabulary work! Keep reading!")`}
              className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-xs placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-y"
            />
          </div>

          <div className="flex items-center justify-between">
            {successToast && (
              <span className="text-xs font-bold text-emerald-700 animate-in fade-in flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Feedback sent!
              </span>
            )}
            <div className="ml-auto flex items-center gap-2">
              {submission.teacherFeedback && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-600 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isPending || !feedback.trim()}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Feedback & Star</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
