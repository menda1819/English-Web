"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import Task from "@/models/Task";
import User from "@/models/User";
import Activity from "@/models/Activity";
import { requireTeacher, requireStudent } from "@/lib/auth/session";
import {
  uploadResourceFile,
  validateFile,
  sanitizeFileName,
  deleteResourceFile,
} from "@/lib/storage";

export interface TaskActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Teacher assigns a new task to a grade or specific student with optional attachment
 */
export async function createTaskAction(
  prevState: TaskActionResult | null,
  formData: FormData
): Promise<TaskActionResult> {
  try {
    const teacher = await requireTeacher();

    const title = (formData.get("title") as string || "").trim();
    const description = (formData.get("description") as string || "").trim();
    const targetType = (formData.get("targetType") as string || "grade") as "grade" | "student" | "all";
    const targetGradeStr = formData.get("targetGrade") as string;
    const targetStudentId = (formData.get("targetStudentId") as string || "").trim();
    const dueDateStr = formData.get("dueDate") as string;
    const attachmentFile = formData.get("attachment") as File | null;

    if (!title || title.length < 3) {
      return { success: false, error: "Task title must be at least 3 characters long." };
    }

    if (!description || description.length < 5) {
      return { success: false, error: "Task instructions must be at least 5 characters long." };
    }

    await connectToDatabase();

    let targetGrade: number | undefined = undefined;
    let studentDocName: string | undefined = undefined;

    if (targetType === "grade") {
      const g = parseInt(targetGradeStr, 10);
      if (isNaN(g) || g < 1 || g > 5) {
        return { success: false, error: "Please select a valid Grade (1 to 5)." };
      }
      targetGrade = g;
    } else if (targetType === "student") {
      if (!targetStudentId) {
        return { success: false, error: "Please select the student you wish to assign this task to." };
      }
      const st = await User.findById(targetStudentId);
      if (!st) {
        return { success: false, error: "Selected student could not be found." };
      }
      studentDocName = st.name;
      targetGrade = st.grade;
    }

    let dueDate: Date | undefined = undefined;
    if (dueDateStr) {
      const parsed = new Date(dueDateStr);
      if (!isNaN(parsed.getTime())) {
        dueDate = parsed;
      }
    }

    // Handle Teacher Attachment upload if provided
    let attachmentName: string | undefined = undefined;
    let attachmentStorageKey: string | undefined = undefined;
    let attachmentMimeType: string | undefined = undefined;
    let attachmentSize: number | undefined = undefined;

    if (attachmentFile && attachmentFile.size > 0) {
      const buffer = Buffer.from(await attachmentFile.arrayBuffer());
      const validation = validateFile(buffer, attachmentFile.type, attachmentFile.name);
      if (!validation.valid) {
        return { success: false, error: validation.error || "Invalid attachment file." };
      }

      const uploadResult = await uploadResourceFile(buffer, attachmentFile.name, attachmentFile.type);
      attachmentName = sanitizeFileName(attachmentFile.name);
      attachmentStorageKey = uploadResult.storageKey;
      attachmentMimeType = uploadResult.mimeType;
      attachmentSize = uploadResult.size;
    }

    const newTask = await Task.create({
      title,
      description,
      targetType,
      targetGrade,
      targetStudentId: targetStudentId ? new mongoose.Types.ObjectId(targetStudentId) : undefined,
      targetStudentName: studentDocName,
      dueDate,
      teacherId: new mongoose.Types.ObjectId(teacher.userId),
      teacherName: teacher.name,
      attachmentName,
      attachmentStorageKey,
      attachmentMimeType,
      attachmentSize,
      submissions: [],
    });

    // Log Activity
    await Activity.create({
      action: "TASK_CREATED",
      actorId: new mongoose.Types.ObjectId(teacher.userId),
      actorName: teacher.name,
      actorRole: "teacher",
      details: `Teacher assigned new task: "${title}" (${targetType === "grade" ? `Grade ${targetGrade}` : targetType === "student" ? studentDocName : "All Grades"})${attachmentName ? ` with file "${attachmentName}"` : ""}`,
    });

    revalidatePath("/teacher/tasks");
    revalidatePath("/student/tasks");

    return { success: true, message: "Task successfully assigned to students! 📋" };
  } catch (err: any) {
    console.error("Error creating task:", err);
    return { success: false, error: err.message || "Failed to assign task." };
  }
}

/**
 * Student ticks a task as done with optional note and completed work document/photo upload
 */
export async function toggleStudentTaskDoneAction(
  taskId: string,
  formData: FormData
): Promise<TaskActionResult> {
  try {
    const student = await requireStudent();

    if (!taskId) {
      return { success: false, error: "Invalid task ID." };
    }

    const studentNote = (formData.get("studentNote") as string || "").trim();
    const file = formData.get("attachment") as File | null;

    await connectToDatabase();
    const task = await Task.findById(taskId);
    if (!task) {
      return { success: false, error: "Task not found." };
    }

    // Verify student record
    const studentDoc = await User.findById(student.userId);
    if (!studentDoc) {
      return { success: false, error: "Student record not found." };
    }

    const studentIdObj = new mongoose.Types.ObjectId(student.userId);

    // Handle student work document / photo upload if provided
    let attachmentName: string | undefined = undefined;
    let attachmentStorageKey: string | undefined = undefined;
    let attachmentMimeType: string | undefined = undefined;
    let attachmentSize: number | undefined = undefined;

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const validation = validateFile(buffer, file.type, file.name);
      if (!validation.valid) {
        return { success: false, error: validation.error || "Invalid file. Please upload PDF, Word, PowerPoint, or image." };
      }

      const uploadResult = await uploadResourceFile(buffer, file.name, file.type);
      attachmentName = sanitizeFileName(file.name);
      attachmentStorageKey = uploadResult.storageKey;
      attachmentMimeType = uploadResult.mimeType;
      attachmentSize = uploadResult.size;
    }

    // Check if submission already exists
    const existingIndex = task.submissions.findIndex(
      (s) => s.studentId.toString() === student.userId
    );

    if (existingIndex >= 0) {
      // If student previously uploaded a file and is replacing it, delete old one
      if (attachmentStorageKey && task.submissions[existingIndex].attachmentStorageKey) {
        await deleteResourceFile(task.submissions[existingIndex].attachmentStorageKey!, "mongodb-gridfs");
      }

      task.submissions[existingIndex].status = "done";
      task.submissions[existingIndex].submittedAt = new Date();
      if (studentNote) {
        task.submissions[existingIndex].studentNote = studentNote;
      }
      if (attachmentStorageKey) {
        task.submissions[existingIndex].attachmentName = attachmentName;
        task.submissions[existingIndex].attachmentStorageKey = attachmentStorageKey;
        task.submissions[existingIndex].attachmentMimeType = attachmentMimeType;
        task.submissions[existingIndex].attachmentSize = attachmentSize;
      }
    } else {
      task.submissions.push({
        studentId: studentIdObj,
        studentName: studentDoc.name,
        studentGrade: studentDoc.grade || 1,
        studentAvatar: studentDoc.avatar || "sprout",
        status: "done",
        submittedAt: new Date(),
        studentNote: studentNote || "",
        attachmentName,
        attachmentStorageKey,
        attachmentMimeType,
        attachmentSize,
        teacherFeedback: "",
        teacherRating: "",
      });
    }

    await task.save();

    // Log Activity for teacher notification
    await Activity.create({
      action: "TASK_SUBMITTED",
      actorId: studentIdObj,
      actorName: studentDoc.name,
      actorRole: "student",
      details: `Student completed task: "${task.title}" (${studentDoc.name}, Grade ${studentDoc.grade})${attachmentName ? ` with work file "${attachmentName}"` : ""}`,
      targetUserId: studentIdObj,
    });

    revalidatePath("/student/tasks");
    revalidatePath("/teacher/tasks");

    return {
      success: true,
      message: "Wonderful job! Task marked as done. Your teacher has been notified! 🎒",
    };
  } catch (err: any) {
    console.error("Error submitting task:", err);
    return { success: false, error: err.message || "Failed to update task." };
  }
}

/**
 * Teacher reviews a student's completed task and provides feedback + sticker/rating
 */
export async function reviewTaskSubmissionAction(
  taskId: string,
  studentId: string,
  teacherFeedback: string,
  teacherRating?: string
): Promise<TaskActionResult> {
  try {
    const teacher = await requireTeacher();

    if (!taskId || !studentId) {
      return { success: false, error: "Task ID and Student ID are required." };
    }

    await connectToDatabase();
    const task = await Task.findById(taskId);
    if (!task) {
      return { success: false, error: "Task not found." };
    }

    const submissionIndex = task.submissions.findIndex(
      (s) => s.studentId.toString() === studentId
    );

    if (submissionIndex === -1) {
      return { success: false, error: "Student submission could not be found." };
    }

    task.submissions[submissionIndex].teacherFeedback = teacherFeedback.trim();
    task.submissions[submissionIndex].teacherRating = teacherRating || "⭐⭐⭐ Outstanding";
    task.submissions[submissionIndex].status = "reviewed";
    task.submissions[submissionIndex].reviewedAt = new Date();

    await task.save();

    // Log Activity
    await Activity.create({
      action: "TASK_REVIEWED",
      actorId: new mongoose.Types.ObjectId(teacher.userId),
      actorName: teacher.name,
      actorRole: "teacher",
      details: `Teacher reviewed task "${task.title}" for ${task.submissions[submissionIndex].studentName}`,
      targetUserId: task.submissions[submissionIndex].studentId,
    });

    revalidatePath("/teacher/tasks");
    revalidatePath("/student/tasks");

    return { success: true, message: "Feedback sent to student! ⭐" };
  } catch (err: any) {
    console.error("Error reviewing task:", err);
    return { success: false, error: err.message || "Failed to save feedback." };
  }
}

/**
 * Teacher deletes an assigned task and its uploaded files
 */
export async function deleteTaskAction(taskId: string): Promise<TaskActionResult> {
  try {
    const teacher = await requireTeacher();

    await connectToDatabase();
    const task = await Task.findById(taskId);
    if (!task) {
      return { success: false, error: "Task not found." };
    }

    // Clean up teacher attachment file
    if (task.attachmentStorageKey) {
      await deleteResourceFile(task.attachmentStorageKey, "mongodb-gridfs");
    }

    // Clean up student submission files
    for (const sub of task.submissions) {
      if (sub.attachmentStorageKey) {
        await deleteResourceFile(sub.attachmentStorageKey, "mongodb-gridfs");
      }
    }

    await Task.findByIdAndDelete(taskId);

    revalidatePath("/teacher/tasks");
    revalidatePath("/student/tasks");

    return { success: true, message: "Task deleted successfully." };
  } catch (err: any) {
    console.error("Error deleting task:", err);
    return { success: false, error: err.message || "Failed to delete task." };
  }
}
