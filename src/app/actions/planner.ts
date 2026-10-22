"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import TeacherWorkItem, {
  TeacherWorkCategory,
  TeacherWorkPriority,
  TeacherWorkStatus,
} from "@/models/TeacherWorkItem";
import { requireTeacher } from "@/lib/auth/session";

export interface PlannerActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Create a new school work / task / reminder item for the teacher
 */
export async function createTeacherWorkItemAction(
  prevState: PlannerActionResult | null,
  formData: FormData
): Promise<PlannerActionResult> {
  try {
    const teacher = await requireTeacher();

    const title = (formData.get("title") as string || "").trim();
    const category = (formData.get("category") as string || "todo") as TeacherWorkCategory;
    const priority = (formData.get("priority") as string || "medium") as TeacherWorkPriority;
    const targetGradeStr = formData.get("targetGrade") as string;
    const dueDateStr = formData.get("dueDate") as string;
    const notes = (formData.get("notes") as string || "").trim();
    const isPinned = formData.get("isPinned") === "true" || formData.get("isPinned") === "on";

    if (!title || title.length < 2) {
      return { success: false, error: "Title must be at least 2 characters long." };
    }

    const validCategories: TeacherWorkCategory[] = [
      "todo",
      "lesson_plan",
      "exam",
      "marks",
      "notes",
    ];
    if (!validCategories.includes(category)) {
      return { success: false, error: "Invalid category selected." };
    }

    const validPriorities: TeacherWorkPriority[] = ["low", "medium", "high", "urgent"];
    if (!validPriorities.includes(priority)) {
      return { success: false, error: "Invalid priority selected." };
    }

    let targetGrade: number | null = null;
    if (targetGradeStr && targetGradeStr !== "all") {
      const g = parseInt(targetGradeStr, 10);
      if (!isNaN(g) && g >= 1 && g <= 5) {
        targetGrade = g;
      }
    }

    let dueDate: Date | null = null;
    if (dueDateStr) {
      const parsed = new Date(dueDateStr);
      if (!isNaN(parsed.getTime())) {
        dueDate = parsed;
      }
    }

    await connectToDatabase();

    await TeacherWorkItem.create({
      teacherId: new mongoose.Types.ObjectId(teacher.userId),
      title,
      category,
      priority,
      status: "pending",
      targetGrade,
      dueDate,
      notes,
      isPinned,
    });

    revalidatePath("/teacher/planner");
    revalidatePath("/teacher");

    return {
      success: true,
      message: "School work item added successfully to your planner!",
    };
  } catch (err: unknown) {
    console.error("Error creating teacher work item:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create work item.",
    };
  }
}

/**
 * Toggle item status between pending / completed or set specific status
 */
export async function toggleWorkItemStatusAction(
  itemId: string,
  newStatus?: TeacherWorkStatus
): Promise<PlannerActionResult> {
  try {
    const teacher = await requireTeacher();

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return { success: false, error: "Invalid item ID." };
    }

    await connectToDatabase();

    const item = await TeacherWorkItem.findOne({
      _id: itemId,
      teacherId: teacher.userId,
    });

    if (!item) {
      return { success: false, error: "Item not found or unauthorized." };
    }

    if (newStatus) {
      item.status = newStatus;
    } else {
      item.status = item.status === "completed" ? "pending" : "completed";
    }

    item.completedAt = item.status === "completed" ? new Date() : null;
    await item.save();

    revalidatePath("/teacher/planner");
    revalidatePath("/teacher");

    return {
      success: true,
      message: item.status === "completed" ? "Marked as completed!" : "Reopened task.",
    };
  } catch (err: unknown) {
    console.error("Error toggling item status:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update item.",
    };
  }
}

/**
 * Pin or unpin an item to the top of reminders
 */
export async function toggleWorkItemPinAction(itemId: string): Promise<PlannerActionResult> {
  try {
    const teacher = await requireTeacher();

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return { success: false, error: "Invalid item ID." };
    }

    await connectToDatabase();

    const item = await TeacherWorkItem.findOne({
      _id: itemId,
      teacherId: teacher.userId,
    });

    if (!item) {
      return { success: false, error: "Item not found." };
    }

    item.isPinned = !item.isPinned;
    await item.save();

    revalidatePath("/teacher/planner");
    return {
      success: true,
      message: item.isPinned ? "Item pinned to top!" : "Item unpinned.",
    };
  } catch (err: unknown) {
    console.error("Error toggling pin:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to toggle pin.",
    };
  }
}

/**
 * Update an existing planner item
 */
export async function updateTeacherWorkItemAction(
  itemId: string,
  formData: FormData
): Promise<PlannerActionResult> {
  try {
    const teacher = await requireTeacher();

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return { success: false, error: "Invalid item ID." };
    }

    const title = (formData.get("title") as string || "").trim();
    const category = (formData.get("category") as string || "todo") as TeacherWorkCategory;
    const priority = (formData.get("priority") as string || "medium") as TeacherWorkPriority;
    const status = (formData.get("status") as string || "pending") as TeacherWorkStatus;
    const targetGradeStr = formData.get("targetGrade") as string;
    const dueDateStr = formData.get("dueDate") as string;
    const notes = (formData.get("notes") as string || "").trim();
    const isPinned = formData.get("isPinned") === "true" || formData.get("isPinned") === "on";

    if (!title || title.length < 2) {
      return { success: false, error: "Title must be at least 2 characters long." };
    }

    await connectToDatabase();

    const item = await TeacherWorkItem.findOne({
      _id: itemId,
      teacherId: teacher.userId,
    });

    if (!item) {
      return { success: false, error: "Item not found." };
    }

    item.title = title;
    item.category = category;
    item.priority = priority;
    item.status = status;
    item.completedAt = status === "completed" ? (item.completedAt || new Date()) : null;
    item.isPinned = isPinned;
    item.notes = notes;

    if (targetGradeStr && targetGradeStr !== "all") {
      const g = parseInt(targetGradeStr, 10);
      item.targetGrade = !isNaN(g) && g >= 1 && g <= 5 ? g : null;
    } else {
      item.targetGrade = null;
    }

    if (dueDateStr) {
      const parsed = new Date(dueDateStr);
      item.dueDate = !isNaN(parsed.getTime()) ? parsed : null;
    } else {
      item.dueDate = null;
    }

    await item.save();

    revalidatePath("/teacher/planner");
    revalidatePath("/teacher");

    return {
      success: true,
      message: "Work item updated successfully!",
    };
  } catch (err: unknown) {
    console.error("Error updating work item:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update item.",
    };
  }
}

/**
 * Delete a planner item
 */
export async function deleteTeacherWorkItemAction(itemId: string): Promise<PlannerActionResult> {
  try {
    const teacher = await requireTeacher();

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return { success: false, error: "Invalid item ID." };
    }

    await connectToDatabase();

    const deleted = await TeacherWorkItem.findOneAndDelete({
      _id: itemId,
      teacherId: teacher.userId,
    });

    if (!deleted) {
      return { success: false, error: "Item not found." };
    }

    revalidatePath("/teacher/planner");
    revalidatePath("/teacher");

    return {
      success: true,
      message: "Item removed from planner.",
    };
  } catch (err: unknown) {
    console.error("Error deleting work item:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete item.",
    };
  }
}

/**
 * Clear all completed items in one click
 */
export async function clearCompletedWorkItemsAction(): Promise<PlannerActionResult> {
  try {
    const teacher = await requireTeacher();

    await connectToDatabase();

    const res = await TeacherWorkItem.deleteMany({
      teacherId: teacher.userId,
      status: "completed",
    });

    revalidatePath("/teacher/planner");
    revalidatePath("/teacher");

    return {
      success: true,
      message: `Cleared ${res.deletedCount} completed items.`,
    };
  } catch (err: unknown) {
    console.error("Error clearing completed items:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to clear completed items.",
    };
  }
}
