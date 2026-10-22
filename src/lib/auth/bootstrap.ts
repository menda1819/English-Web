import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

let hasBootstrapped = false;

/**
 * Ensures at least one teacher exists in the database.
 * If 0 teachers exist and environment variables are provided, creates the initial teacher.
 * Never creates dummy accounts if environment variables are not configured.
 */
export async function ensureInitialTeacher(): Promise<void> {
  if (hasBootstrapped) return;

  try {
    await connectToDatabase();
    const teacherCount = await User.countDocuments({ role: "teacher" });

    if (teacherCount === 0) {
      const name = process.env.INITIAL_TEACHER_NAME?.trim() || "Teacher";
      const email = process.env.INITIAL_TEACHER_EMAIL?.toLowerCase().trim();
      const password = process.env.INITIAL_TEACHER_PASSWORD?.trim();

      if (!email || !password) {
        console.warn(
          "[Bootstrap] No teacher exists and INITIAL_TEACHER_EMAIL / INITIAL_TEACHER_PASSWORD are not configured. Run 'npm run seed:teacher' after configuring environment variables."
        );
        hasBootstrapped = true;
        return;
      }

      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      await User.create({
        name,
        email,
        passwordHash,
        role: "teacher",
        avatar: "owl",
        status: "active",
      });

      console.log(`[Bootstrap] Initial teacher account created: ${email}`);
    }

    hasBootstrapped = true;
  } catch (error) {
    console.error("[Bootstrap] Error ensuring initial teacher:", error);
  }
}
