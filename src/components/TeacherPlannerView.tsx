"use client";

import React, { useState, useTransition, useMemo } from "react";
import {
  CheckCircle2,
  Circle,
  Pin,
  PinOff,
  Calendar,
  AlertTriangle,
  BookOpen,
  FileCheck2,
  GraduationCap,
  StickyNote,
  Plus,
  Search,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Bell,
  Clock,
  Sparkles,
  X,
  ListFilter,
  Check,
  RefreshCw,
} from "lucide-react";
import {
  toggleWorkItemStatusAction,
  toggleWorkItemPinAction,
  deleteTeacherWorkItemAction,
  createTeacherWorkItemAction,
  updateTeacherWorkItemAction,
  clearCompletedWorkItemsAction,
  PlannerActionResult,
} from "@/app/actions/planner";
import { TeacherWorkCategory, TeacherWorkPriority, TeacherWorkStatus } from "@/models/TeacherWorkItem";

export interface SerializedTeacherWorkItem {
  _id: string;
  title: string;
  category: TeacherWorkCategory;
  priority: TeacherWorkPriority;
  status: TeacherWorkStatus;
  targetGrade?: number | null;
  dueDate?: string | null;
  notes?: string;
  isPinned: boolean;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TeacherPlannerViewProps {
  initialItems: SerializedTeacherWorkItem[];
  teacherName: string;
}

export function TeacherPlannerView({ initialItems, teacherName }: TeacherPlannerViewProps) {
  const [items, setItems] = useState<SerializedTeacherWorkItem[]>(initialItems);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SerializedTeacherWorkItem | null>(null);
  const [isPending, startTransition] = useTransition();
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Keep internal state in sync when server props refresh
  React.useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setActionMessage({ type, text });
    setTimeout(() => {
      setActionMessage((prev) => (prev?.text === text ? null : prev));
    }, 3500);
  };

  // Toggle notes expansion
  const toggleNotes = (id: string) => {
    setExpandedNotes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Quick toggle status (completed / pending)
  const handleToggleStatus = (item: SerializedTeacherWorkItem) => {
    const nextStatus = item.status === "completed" ? "pending" : "completed";
    // Optimistic UI update
    setItems((prev) =>
      prev.map((i) =>
        i._id === item._id
          ? {
              ...i,
              status: nextStatus,
              completedAt: nextStatus === "completed" ? new Date().toISOString() : null,
            }
          : i
      )
    );

    startTransition(async () => {
      const res = await toggleWorkItemStatusAction(item._id, nextStatus);
      if (!res.success) {
        // Revert on failure
        setItems(initialItems);
        showToast(res.error || "Failed to update item", "error");
      } else {
        showToast(nextStatus === "completed" ? "Marked as done!" : "Reopened task");
      }
    });
  };

  // Toggle Pin
  const handleTogglePin = (item: SerializedTeacherWorkItem) => {
    setItems((prev) =>
      prev.map((i) => (i._id === item._id ? { ...i, isPinned: !i.isPinned } : i))
    );

    startTransition(async () => {
      const res = await toggleWorkItemPinAction(item._id);
      if (!res.success) {
        setItems(initialItems);
        showToast(res.error || "Failed to toggle pin", "error");
      } else {
        showToast(item.isPinned ? "Unpinned from top" : "Pinned to top!");
      }
    });
  };

  // Delete item
  const handleDelete = (item: SerializedTeacherWorkItem) => {
    if (!confirm(`Are you sure you want to remove "${item.title}"?`)) return;

    setItems((prev) => prev.filter((i) => i._id !== item._id));

    startTransition(async () => {
      const res = await deleteTeacherWorkItemAction(item._id);
      if (!res.success) {
        setItems(initialItems);
        showToast(res.error || "Failed to delete item", "error");
      } else {
        showToast("Item deleted");
      }
    });
  };

  // Clear all completed items
  const handleClearCompleted = () => {
    const completedCount = items.filter((i) => i.status === "completed").length;
    if (completedCount === 0) return;
    if (!confirm(`Clear all ${completedCount} completed items from your planner?`)) return;

    setItems((prev) => prev.filter((i) => i.status !== "completed"));

    startTransition(async () => {
      const res = await clearCompletedWorkItemsAction();
      if (!res.success) {
        setItems(initialItems);
        showToast(res.error || "Failed to clear completed items", "error");
      } else {
        showToast(res.message || "Completed items cleared");
      }
    });
  };

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (activeCategory !== "all" && item.category !== activeCategory) {
        return false;
      }
      // Status filter
      if (statusFilter === "active" && item.status === "completed") {
        return false;
      }
      if (statusFilter === "completed" && item.status !== "completed") {
        return false;
      }
      // Grade filter
      if (gradeFilter !== "all") {
        const g = parseInt(gradeFilter, 10);
        if (item.targetGrade !== g) return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesNotes = item.notes?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesNotes) return false;
      }
      return true;
    });
  }, [items, activeCategory, statusFilter, gradeFilter, searchQuery]);

  // Separate pinned vs regular
  const pinnedItems = useMemo(
    () => filteredItems.filter((i) => i.isPinned && i.status !== "completed"),
    [filteredItems]
  );
  const otherItems = useMemo(
    () => filteredItems.filter((i) => !i.isPinned || i.status === "completed"),
    [filteredItems]
  );

  // Statistics
  const stats = useMemo(() => {
    const total = items.length;
    const completed = items.filter((i) => i.status === "completed").length;
    const pending = total - completed;
    const lessonPlans = items.filter((i) => i.category === "lesson_plan" && i.status !== "completed").length;
    const examsAndMarks = items.filter(
      (i) => (i.category === "exam" || i.category === "marks") && i.status !== "completed"
    ).length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const dueSoon = items.filter((i) => {
      if (i.status === "completed" || !i.dueDate) return false;
      const d = new Date(i.dueDate);
      return d <= endOfToday;
    }).length;

    return { total, completed, pending, lessonPlans, examsAndMarks, dueSoon };
  }, [items]);

  // Category Counts
  const counts = useMemo(() => {
    const c: Record<string, number> = {
      all: items.length,
      todo: 0,
      lesson_plan: 0,
      exam: 0,
      marks: 0,
      notes: 0,
    };
    items.forEach((item) => {
      if (c[item.category] !== undefined) {
        c[item.category]++;
      }
    });
    return c;
  }, [items]);

  // Date styling helper
  const getDueBadge = (dueDateStr?: string | null, isCompleted = false) => {
    if (!dueDateStr) return null;
    const date = new Date(dueDateStr);
    if (isNaN(date.getTime())) return null;

    if (isCompleted) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
          <Calendar className="w-3 h-3" />
          {date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </span>
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-200 animate-pulse">
          <AlertTriangle className="w-3 h-3" />
          Overdue ({Math.abs(diffDays)}d ago)
        </span>
      );
    } else if (diffDays === 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
          <Bell className="w-3 h-3 text-amber-600" />
          Due Today!
        </span>
      );
    } else if (diffDays === 1) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-800 bg-sky-100 px-2 py-0.5 rounded-md">
          <Clock className="w-3 h-3" />
          Due Tomorrow
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
          <Calendar className="w-3 h-3 text-stone-500" />
          Due {date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </span>
      );
    }
  };

  // Category Icon & Badge
  const getCategoryMeta = (cat: TeacherWorkCategory) => {
    switch (cat) {
      case "lesson_plan":
        return {
          label: "Lesson Plan",
          icon: BookOpen,
          bg: "bg-purple-100 text-purple-900 border-purple-200",
          accent: "text-purple-700",
        };
      case "exam":
        return {
          label: "Exams & Tests",
          icon: GraduationCap,
          bg: "bg-rose-100 text-rose-900 border-rose-200",
          accent: "text-rose-700",
        };
      case "marks":
        return {
          label: "Marks & Grading",
          icon: FileCheck2,
          bg: "bg-amber-100 text-amber-900 border-amber-200",
          accent: "text-amber-700",
        };
      case "notes":
        return {
          label: "Classroom Notes",
          icon: StickyNote,
          bg: "bg-emerald-100 text-emerald-900 border-emerald-200",
          accent: "text-emerald-700",
        };
      case "todo":
      default:
        return {
          label: "School Work",
          icon: CheckSquare,
          bg: "bg-sky-100 text-sky-900 border-sky-200",
          accent: "text-sky-700",
        };
    }
  };

  // Priority Badge
  const getPriorityBadge = (priority: TeacherWorkPriority) => {
    switch (priority) {
      case "urgent":
        return (
          <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-rose-600 text-white shadow-xs">
            Urgent
          </span>
        );
      case "high":
        return (
          <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
            High
          </span>
        );
      case "medium":
        return (
          <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            Medium
          </span>
        );
      case "low":
      default:
        return (
          <span className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
            Low
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast feedback */}
      {actionMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border text-sm font-semibold transition-all animate-bounce ${
            actionMessage.type === "success"
              ? "bg-emerald-800 text-white border-emerald-600"
              : "bg-rose-800 text-white border-rose-600"
          }`}
        >
          {actionMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-300" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Top Banner & Quick Metrics */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-emerald-900/60 border border-emerald-500/40 text-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Teacher Private Desk • School Work & Planner
              </span>
            </div>
            <h2
              className="text-2xl sm:text-3xl font-extrabold tracking-tight"
              style={{ fontFamily: "var(--font-fredoka)" }}
            >
              School Work, Tasks & Classroom Notes 📋
            </h2>
            <p className="text-emerald-100/90 text-sm mt-1 max-w-2xl">
              Organize pending school work, curriculum lesson plans, upcoming exams, mark sheets, and daily classroom reminders all in one private place.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setEditingItem(null);
                setIsCreateModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-900 font-extrabold text-sm shadow-md transition-all hover:scale-103 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>Add School Task / Note</span>
            </button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-emerald-600/50">
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
            <p className="text-xs font-medium text-emerald-200">Pending Tasks</p>
            <p className="text-2xl font-black mt-0.5" style={{ fontFamily: "var(--font-fredoka)" }}>
              {stats.pending}
            </p>
            <span className="text-[11px] text-emerald-300/90">
              {stats.completed} of {stats.total} completed
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
            <p className="text-xs font-medium text-emerald-200">Due Today / Overdue</p>
            <p className="text-2xl font-black mt-0.5 text-amber-300" style={{ fontFamily: "var(--font-fredoka)" }}>
              {stats.dueSoon}
            </p>
            <span className="text-[11px] text-emerald-200/80">Requires prompt attention</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
            <p className="text-xs font-medium text-emerald-200">Active Lesson Plans</p>
            <p className="text-2xl font-black mt-0.5 text-purple-200" style={{ fontFamily: "var(--font-fredoka)" }}>
              {stats.lessonPlans}
            </p>
            <span className="text-[11px] text-emerald-200/80">Curriculum prep & worksheets</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3.5 border border-white/10">
            <p className="text-xs font-medium text-emerald-200">Exams & Marks Grading</p>
            <p className="text-2xl font-black mt-0.5 text-rose-200" style={{ fontFamily: "var(--font-fredoka)" }}>
              {stats.examsAndMarks}
            </p>
            <span className="text-[11px] text-emerald-200/80">Tests & mark lists pending</span>
          </div>
        </div>
      </div>

      {/* Category Pills & Filters */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-xs space-y-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "all", label: "All Items", icon: ListFilter, count: counts.all },
            { id: "todo", label: "School Work & Pending", icon: CheckSquare, count: counts.todo },
            { id: "lesson_plan", label: "Lesson Plans", icon: BookOpen, count: counts.lesson_plan },
            { id: "exam", label: "Exams & Tests", icon: GraduationCap, count: counts.exam },
            { id: "marks", label: "Marks & Grading", icon: FileCheck2, count: counts.marks },
            { id: "notes", label: "Classroom Notes & Reminders", icon: StickyNote, count: counts.notes },
          ].map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm scale-102"
                    : "bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/70"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-emerald-700"}`} />
                <span>{cat.label}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isActive ? "bg-white/20 text-white" : "bg-stone-200 text-stone-700"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search, Grade & Status Sub-filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-stone-100">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search work, tasks, notes, or reminders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Grade Filter */}
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-semibold text-stone-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">All Grades</option>
              <option value="1">Grade 1</option>
              <option value="2">Grade 2</option>
              <option value="3">Grade 3</option>
              <option value="4">Grade 4</option>
              <option value="5">Grade 5</option>
            </select>

            {/* Status Segmented Buttons */}
            <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-white text-stone-900 shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("active")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === "active"
                    ? "bg-white text-emerald-800 shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Pending ({stats.pending})
              </button>
              <button
                onClick={() => setStatusFilter("completed")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === "completed"
                    ? "bg-white text-stone-900 shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Done ({stats.completed})
              </button>
            </div>

            {/* Batch clear completed */}
            {stats.completed > 0 && (
              <button
                onClick={handleClearCompleted}
                disabled={isPending}
                className="px-3 py-1.5 text-xs font-bold text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-rose-200"
                title="Clear all completed items from list"
              >
                Clear Done ({stats.completed})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pinned Urgent Reminders Section */}
      {pinnedItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Pin className="w-4 h-4 text-amber-600 fill-amber-500" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
              Pinned & Urgent Reminders ({pinnedItems.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pinnedItems.map((item) => renderPlannerCard(item, true))}
          </div>
        </div>
      )}

      {/* Main Todo / Work Items List */}
      <div className="space-y-3">
        {pinnedItems.length > 0 && otherItems.length > 0 && (
          <div className="flex items-center justify-between pt-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-500">
              School Work Items & Task List ({otherItems.length})
            </h3>
          </div>
        )}

        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-300">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-4">
              <CheckSquare className="w-8 h-8" />
            </div>
            <h4
              className="text-xl font-bold text-stone-800"
              style={{ fontFamily: "var(--font-fredoka)" }}
            >
              No school work items found!
            </h4>
            <p className="text-sm text-stone-500 mt-1 max-w-md mx-auto">
              {searchQuery || activeCategory !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters or search terms."
                : "Your school desk planner is completely clear! Add your lesson plans, upcoming exams, marks, or reminders to stay ahead."}
            </p>
            <button
              onClick={() => {
                setEditingItem(null);
                setIsCreateModalOpen(true);
              }}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create First School Task</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {otherItems.map((item) => renderPlannerCard(item, false))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {(isCreateModalOpen || editingItem) && (
        <PlannerItemModal
          isOpen={isCreateModalOpen || !!editingItem}
          initialData={editingItem}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingItem(null);
          }}
          onSaved={(msg) => {
            setIsCreateModalOpen(false);
            setEditingItem(null);
            showToast(msg);
          }}
        />
      )}
    </div>
  );

  function renderPlannerCard(item: SerializedTeacherWorkItem, isFeatured = false) {
    const isCompleted = item.status === "completed";
    const catMeta = getCategoryMeta(item.category);
    const CatIcon = catMeta.icon;
    const isNotesOpen = expandedNotes[item._id] || false;
    const hasNotes = Boolean(item.notes && item.notes.trim().length > 0);

    return (
      <div
        key={item._id}
        className={`group bg-white rounded-2xl border transition-all duration-200 ${
          isFeatured
            ? "border-amber-200 bg-amber-50/20 shadow-xs hover:border-amber-300"
            : isCompleted
            ? "border-stone-200/70 bg-stone-50/60 opacity-80"
            : "border-stone-200/90 shadow-xs hover:shadow-md hover:border-emerald-300"
        } p-4 sm:p-5`}
      >
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Checkbox */}
          <button
            type="button"
            onClick={() => handleToggleStatus(item)}
            disabled={isPending}
            className="mt-0.5 shrink-0 focus:outline-hidden transition-transform hover:scale-115 cursor-pointer"
            title={isCompleted ? "Mark as pending" : "Tick as completed"}
            aria-label={isCompleted ? "Mark as pending" : "Tick as completed"}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
            ) : (
              <Circle className="w-6 h-6 text-stone-400 group-hover:text-emerald-500" />
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Badges row */}
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              {/* Category */}
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${catMeta.bg}`}
              >
                <CatIcon className="w-3 h-3" />
                {catMeta.label}
              </span>

              {/* Priority */}
              {getPriorityBadge(item.priority)}

              {/* Target Grade */}
              {item.targetGrade ? (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Grade {item.targetGrade}
                </span>
              ) : (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                  All Grades
                </span>
              )}

              {/* Due Date Indicator */}
              {getDueBadge(item.dueDate, isCompleted)}
            </div>

            {/* Title */}
            <div className="flex items-center justify-between gap-2">
              <h4
                className={`text-base font-bold text-stone-900 leading-snug break-words ${
                  isCompleted ? "line-through text-stone-500" : ""
                }`}
              >
                {item.title}
              </h4>
            </div>

            {/* Notes preview / toggler */}
            {hasNotes && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => toggleNotes(item._id)}
                  className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
                >
                  <StickyNote className="w-3.5 h-3.5" />
                  <span>{isNotesOpen ? "Hide Notes & Details" : "View Notes & Reminders"}</span>
                  {isNotesOpen ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                {isNotesOpen && (
                  <div className="mt-2 p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-xs sm:text-sm text-stone-700 whitespace-pre-wrap font-sans leading-relaxed">
                    {item.notes}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions (Pin, Edit, Delete) */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Pin */}
            <button
              type="button"
              onClick={() => handleTogglePin(item)}
              disabled={isPending}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                item.isPinned
                  ? "text-amber-600 hover:bg-amber-100"
                  : "text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              }`}
              title={item.isPinned ? "Unpin item" : "Pin to top"}
            >
              {item.isPinned ? (
                <Pin className="w-4 h-4 fill-amber-500 text-amber-600" />
              ) : (
                <Pin className="w-4 h-4" />
              )}
            </button>

            {/* Edit */}
            <button
              type="button"
              onClick={() => setEditingItem(item)}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
              title="Edit item"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={() => handleDelete(item)}
              disabled={isPending}
              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Delete item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }
}

/**
 * Modal dialog for Creating or Editing a Planner Item
 */
function PlannerItemModal({
  isOpen,
  initialData,
  onClose,
  onSaved,
}: {
  isOpen: boolean;
  initialData: SerializedTeacherWorkItem | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const isEditing = Boolean(initialData);

  const [title, setTitle] = useState(initialData?.title || "");
  const [category, setCategory] = useState<TeacherWorkCategory>(
    initialData?.category || "todo"
  );
  const [priority, setPriority] = useState<TeacherWorkPriority>(
    initialData?.priority || "medium"
  );
  const [targetGrade, setTargetGrade] = useState<string>(
    initialData?.targetGrade ? String(initialData.targetGrade) : "all"
  );
  const [dueDate, setDueDate] = useState<string>(
    initialData?.dueDate ? initialData.dueDate.slice(0, 10) : ""
  );
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [isPinned, setIsPinned] = useState(initialData?.isPinned || false);
  const [status, setStatus] = useState<TeacherWorkStatus>(
    initialData?.status || "pending"
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.trim().length < 2) {
      setError("Please provide a title with at least 2 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("category", category);
    formData.append("priority", priority);
    formData.append("targetGrade", targetGrade);
    formData.append("dueDate", dueDate);
    formData.append("notes", notes.trim());
    if (isPinned) formData.append("isPinned", "true");
    if (isEditing) formData.append("status", status);

    try {
      let res: PlannerActionResult;
      if (isEditing && initialData) {
        res = await updateTeacherWorkItemAction(initialData._id, formData);
      } else {
        res = await createTeacherWorkItemAction(null, formData);
      }

      if (!res.success) {
        setError(res.error || "An error occurred");
        setLoading(false);
      } else {
        onSaved(res.message || "Saved successfully!");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save item.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-stone-200 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3
                className="text-lg font-bold text-stone-900"
                style={{ fontFamily: "var(--font-fredoka)" }}
              >
                {isEditing ? "Edit School Task / Note" : "New School Task & Planner Item"}
              </h3>
              <p className="text-xs text-stone-500">
                Teacher Private Workspace • Strictly for your eyes only
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-700 mb-1">
              Title / Task Summary *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Prepare Grade 3 Unit 4 Phonics worksheet, Grade 2 term marks, etc."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TeacherWorkCategory)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="todo">School Work & To-Do</option>
                <option value="lesson_plan">Lesson Plan & Curriculum</option>
                <option value="exam">Exams, Quizzes & Tests</option>
                <option value="marks">Marks, Grading & Reports</option>
                <option value="notes">Classroom Notes & Reminders</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-700 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TeacherWorkPriority)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent Priority 🔥</option>
              </select>
            </div>
          </div>

          {/* Target Grade & Due Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Target Grade */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-700 mb-1">
                Relevant Grade
              </label>
              <select
                value={targetGrade}
                onChange={(e) => setTargetGrade(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">General / All Grades</option>
                <option value="1">Grade 1</option>
                <option value="2">Grade 2</option>
                <option value="3">Grade 3</option>
                <option value="4">Grade 4</option>
                <option value="5">Grade 5</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-700 mb-1">
                Due Date / Target Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
              </input>
            </div>
          </div>

          {/* Status (if editing) */}
          {isEditing && (
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TeacherWorkStatus)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed / Done</option>
              </select>
            </div>
          )}

          {/* Detailed Notes / Reminders */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-700 mb-1">
              Notes, Details & Reminders (Optional)
            </label>
            <textarea
              rows={4}
              placeholder="Add lesson plan steps, exam questions, grading notes, or classroom reminders..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-y leading-relaxed"
            />
          </div>

          {/* Pin toggle */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="pinCheckbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded-sm border-stone-300 focus:ring-emerald-500 cursor-pointer"
            />
            <label
              htmlFor="pinCheckbox"
              className="text-xs font-bold text-stone-700 flex items-center gap-1.5 cursor-pointer"
            >
              <Pin className="w-3.5 h-3.5 text-amber-600" />
              Pin to Top of Reminders (Urgent Priority)
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-sm font-semibold text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all hover:scale-102 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEditing ? "Save Changes" : "Add to Planner"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
