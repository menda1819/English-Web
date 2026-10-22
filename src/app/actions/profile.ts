"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Activity from "@/models/Activity";
import { requireAuth, setSessionCookie } from "@/lib/auth/session";
import { uploadAvatarFile, deleteAvatarFile } from "@/lib/storage";

export interface ProfileActionResult {
  success: boolean;
  message?: string;
  error?: string;
  updatedData?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

const ALLOWED_PRESETS = [
  "sprout",
  "bee",
  "owl",
  "fox",
  "panda",
  "bunny",
  "lion",
  "sunflower",
  "teacher",
  "star",
];

const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const MAX_AVATAR_SIZE = 3 * 1024 * 1024; // 3 MB

/**
 * Update user profile details (Name, Username/Email, Avatar)
 */
export async function updateProfileDetailsAction(
  prevState: ProfileActionResult | null,
  formData: FormData
): Promise<ProfileActionResult> {
  try {
    const session = await requireAuth();

    const name = (formData.get("name") as string || "").trim();
    const emailOrUsername = (formData.get("email") as string || "").trim().toLowerCase();
    const avatarChoice = (formData.get("avatarChoice") as string || "preset").trim();
    const avatarPreset = (formData.get("avatarPreset") as string || "").trim();
    const avatarFile = formData.get("avatarFile") as File | null;

    if (!name || name.length < 2) {
      return { success: false, error: "Display name must be at least 2 characters long." };
    }

    if (!emailOrUsername || emailOrUsername.length < 3) {
      return { success: false, error: "Username/Email must be at least 3 characters long." };
    }

    // Basic format check: no spaces
    if (/\s/.test(emailOrUsername)) {
      return { success: false, error: "Username/Email cannot contain spaces." };
    }

    await connectToDatabase();
    const user = await User.findById(session.userId);
    if (!user) {
      return { success: false, error: "User account could not be found." };
    }

    // Check if email/username changed and is taken by another user
    if (emailOrUsername !== user.email.toLowerCase()) {
      const existing = await User.findOne({
        email: emailOrUsername,
        _id: { $ne: user._id },
      });
      if (existing) {
        return {
          success: false,
          error: "That username or email is already registered to another account. Please pick a different one.",
        };
      }
      user.email = emailOrUsername;
    }

    user.name = name;

    // Handle Avatar selection or upload
    if (avatarChoice === "upload" && avatarFile && avatarFile.size > 0) {
      if (avatarFile.size > MAX_AVATAR_SIZE) {
        return { success: false, error: "Profile picture exceeds maximum limit of 3MB." };
      }

      if (!ALLOWED_IMAGE_MIME_TYPES.includes(avatarFile.type.toLowerCase())) {
        return {
          success: false,
          error: "Only JPG, PNG, WebP, or GIF image files are allowed for profile pictures.",
        };
      }

      const fileBuffer = Buffer.from(await avatarFile.arrayBuffer());

      // If user previously had a GridFS avatar, delete old one
      if (user.avatar && user.avatar.startsWith("/api/avatar/")) {
        const oldFileId = user.avatar.replace("/api/avatar/", "");
        await deleteAvatarFile(oldFileId);
      }

      const fileId = await uploadAvatarFile(
        fileBuffer,
        avatarFile.name || "profile.jpg",
        avatarFile.type
      );

      user.avatar = `/api/avatar/${fileId}`;
    } else if (avatarChoice === "preset") {
      const validPreset = ALLOWED_PRESETS.includes(avatarPreset) ? avatarPreset : "sprout";

      // If switching from custom uploaded image to preset, clean up old file
      if (user.avatar && user.avatar.startsWith("/api/avatar/")) {
        const oldFileId = user.avatar.replace("/api/avatar/", "");
        await deleteAvatarFile(oldFileId);
      }

      user.avatar = validPreset;
    }

    await user.save();

    // Re-issue updated session cookie
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

    // Log Activity
    await Activity.create({
      action: "PROFILE_UPDATED",
      actorId: user._id,
      actorName: user.name,
      actorRole: user.role,
      details: `${user.role === "teacher" ? "Teacher" : "Student"} updated their profile (${user.name})`,
      targetUserId: user._id,
    });

    revalidatePath("/teacher");
    revalidatePath("/student");
    revalidatePath("/teacher/profile");
    revalidatePath("/student/profile");
    revalidatePath("/teacher/students");

    return {
      success: true,
      message: "Profile updated successfully! ✨",
      updatedData: {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    };
  } catch (err: any) {
    console.error("Error updating profile:", err);
    return {
      success: false,
      error: err.message || "An unexpected error occurred while updating your profile.",
    };
  }
}

/**
 * Update user password with current password verification
 */
export async function updatePasswordAction(
  prevState: ProfileActionResult | null,
  formData: FormData
): Promise<ProfileActionResult> {
  try {
    const session = await requireAuth();

    const currentPassword = (formData.get("currentPassword") as string || "").trim();
    const newPassword = (formData.get("newPassword") as string || "").trim();
    const confirmPassword = (formData.get("confirmPassword") as string || "").trim();

    if (!currentPassword) {
      return { success: false, error: "Please enter your current password to verify your identity." };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: "New password must be at least 6 characters long." };
    }

    if (newPassword !== confirmPassword) {
      return { success: false, error: "New password and password confirmation do not match." };
    }

    await connectToDatabase();
    const user = await User.findById(session.userId);
    if (!user) {
      return { success: false, error: "User account could not be found." };
    }

    // Verify current password
    const isCurrentValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      return { success: false, error: "The current password you entered is incorrect. Please try again." };
    }

    // Prevent reusing the exact same password
    const isSameAsOld = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSameAsOld) {
      return { success: false, error: "Your new password cannot be the same as your current password." };
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Log Activity
    await Activity.create({
      action: "PASSWORD_CHANGED",
      actorId: user._id,
      actorName: user.name,
      actorRole: user.role,
      details: `${user.role === "teacher" ? "Teacher" : "Student"} updated their security password (${user.name})`,
      targetUserId: user._id,
    });

    return {
      success: true,
      message: "Password changed successfully! Keep your new password in a safe place. 🔒",
    };
  } catch (err: any) {
    console.error("Error updating password:", err);
    return {
      success: false,
      error: err.message || "An unexpected error occurred while updating your password.",
    };
  }
}
