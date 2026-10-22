"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db";
import User, { UserStatus } from "@/models/User";
import Activity from "@/models/Activity";
import { requireTeacher } from "@/lib/auth/session";

/**
 * Toggle a student account between active and inactive.
 * Strictly teacher-only action.
 */
export async function toggleStudentStatusAction(
  studentId: string,
  newStatus: UserStatus
): Promise<{ success: boolean; error?: string }> {
  const teacher = await requireTeacher();

  await connectToDatabase();
  const student = await User.findById(studentId);

  if (!student) {
    return { success: false, error: "Student account not found." };
  }

  if (student.role !== "student") {
    return { success: false, error: "Only student accounts can be managed." };
  }

  student.status = newStatus;
  await student.save();

  await Activity.create({
    action: "STUDENT_STATUS_CHANGED",
    actorId: teacher.userId,
    actorName: teacher.name,
    actorRole: "teacher",
    details: `${newStatus === "active" ? "Reactivated" : "Paused"} student account: ${student.name} (${student.email})`,
    targetUserId: student._id,
  });

  revalidatePath("/teacher/students");
  revalidatePath("/teacher");

  return { success: true };
}

/**
 * Update a student's grade permissions (granting access to all grades or specific grades).
 * Strictly teacher-only action.
 */
export async function updateStudentGradePermissionsAction(
  studentId: string,
  accessAllGrades: boolean,
  allowedGrades: number[]
): Promise<{ success: boolean; error?: string }> {
  const teacher = await requireTeacher();

  await connectToDatabase();
  const student = await User.findById(studentId);

  if (!student) {
    return { success: false, error: "Student account not found." };
  }

  if (student.role !== "student") {
    return { success: false, error: "Only student accounts have grade permissions." };
  }

  const validGrades = (allowedGrades || [])
    .map((g) => Number(g))
    .filter((g) => !isNaN(g) && g >= 1 && g <= 5);

  student.accessAllGrades = Boolean(accessAllGrades);
  student.allowedGrades = validGrades;
  await student.save();

  const details = accessAllGrades
    ? `Granted full access to ALL Grades (1–5) for student: ${student.name}`
    : validGrades.length > 0
    ? `Updated grade permissions for ${student.name}: Enrolled in Grade ${student.grade}, granted extra access to Grade(s) ${validGrades.join(", ")}`
    : `Reset grade access for ${student.name} to their enrolled Grade ${student.grade} only`;

  await Activity.create({
    action: "STUDENT_PERMISSIONS_CHANGED",
    actorId: teacher.userId,
    actorName: teacher.name,
    actorRole: "teacher",
    details,
    targetUserId: student._id,
  });

  revalidatePath("/teacher/students");
  revalidatePath("/student");

  return { success: true };
}
