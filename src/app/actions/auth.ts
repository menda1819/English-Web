"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import User, { UserRole } from "@/models/User";
import Activity from "@/models/Activity";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth/session";
import { ensureInitialTeacher } from "@/lib/auth/bootstrap";

export interface AuthActionResult {
  success: boolean;
  error?: string;
  redirectTo?: string;
}

/**
 * Handle Login for both Teacher and Student
 */
export async function loginAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const emailOrUsername = (formData.get("identifier") as string || "").trim().toLowerCase();
  const password = (formData.get("password") as string || "").trim();

  if (!emailOrUsername || !password) {
    return { success: false, error: "Please enter your username/email and password." };
  }

  await ensureInitialTeacher();
  await connectToDatabase();

  const user = await User.findOne({ email: emailOrUsername });
  if (!user) {
    return {
      success: false,
      error: "We could not find an account with those details. Please check your spelling!",
    };
  }

  if (user.status !== "active") {
    return {
      success: false,
      error: "Your student account has been paused by the teacher. Please speak with your teacher to reactivate it.",
    };
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return { success: false, error: "Incorrect password. Please try again!" };
  }

  await setSessionCookie({
    userId: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    grade: user.grade,
    avatar: user.avatar,
    status: user.status,
    accessAllGrades: Boolean(user.accessAllGrades),
    allowedGrades: user.allowedGrades ? Array.from(user.allowedGrades).map(Number) : [],
  });

  const destination = user.role === "teacher" ? "/teacher" : "/student";
  return { success: true, redirectTo: destination };
}

/**
 * Register a new Student account.
 * Crucial security boundary: Role is HARDCODED to "student". Teacher creation via this action is impossible.
 */
export async function registerStudentAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const name = (formData.get("name") as string || "").trim();
  const emailOrUsername = (formData.get("identifier") as string || "").trim().toLowerCase();
  const password = (formData.get("password") as string || "").trim();
  const gradeStr = formData.get("grade") as string;
  const avatar = (formData.get("avatar") as string || "sprout").trim();

  if (!name || name.length < 2) {
    return { success: false, error: "Please enter the student's name (at least 2 letters)." };
  }

  if (!emailOrUsername || emailOrUsername.length < 3) {
    return { success: false, error: "Please choose a username or email (at least 3 characters)." };
  }

  if (!password || password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }

  const grade = parseInt(gradeStr, 10);
  if (isNaN(grade) || grade < 1 || grade > 5) {
    return { success: false, error: "Please select your primary grade (Grades 1 through 5)." };
  }

  await connectToDatabase();

  const existing = await User.findOne({ email: emailOrUsername });
  if (existing) {
    return {
      success: false,
      error: "That username or email is already taken. Please pick another one!",
    };
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const newStudent = await User.create({
    name,
    email: emailOrUsername,
    passwordHash,
    role: "student" as UserRole, // Strictly enforced: NEVER allows teacher
    grade,
    avatar,
    status: "active",
  });

  // Log audit activity
  await Activity.create({
    action: "STUDENT_REGISTERED",
    actorId: newStudent._id,
    actorName: newStudent.name,
    actorRole: "student",
    details: `Student registered: ${newStudent.name} (Grade ${grade})`,
    targetUserId: newStudent._id,
  });

  await setSessionCookie({
    userId: newStudent._id.toString(),
    email: newStudent.email,
    name: newStudent.name,
    role: "student",
    grade: newStudent.grade,
    avatar: newStudent.avatar,
    status: "active",
    accessAllGrades: false,
    allowedGrades: [],
  });

  return { success: true, redirectTo: "/student" };
}

/**
 * Handle Logout
 */
export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}
