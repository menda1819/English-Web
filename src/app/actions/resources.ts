"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db";
import Resource, { PublicationStatus, ResourceType } from "@/models/Resource";
import Activity from "@/models/Activity";
import { requireTeacher } from "@/lib/auth/session";
import {
  uploadResourceFile,
  deleteResourceFile,
  validateFile,
  sanitizeFileName,
} from "@/lib/storage";

export interface ResourceActionResult {
  success: boolean;
  error?: string;
  resourceId?: string;
}

/**
 * Create a new educational resource with file upload.
 * Strictly teacher-only action.
 */
export async function createResourceAction(
  prevState: ResourceActionResult | null,
  formData: FormData
): Promise<ResourceActionResult> {
  const teacher = await requireTeacher();

  const title = (formData.get("title") as string || "").trim();
  const description = (formData.get("description") as string || "").trim();
  const topic = (formData.get("topic") as string || "").trim();
  const type = (formData.get("type") as ResourceType) || "worksheet";
  const instructions = (formData.get("instructions") as string || "").trim();
  const publicationStatus = (formData.get("publicationStatus") as PublicationStatus) || "draft";
  const tagsRaw = (formData.get("tags") as string || "");
  const gradesRaw = formData.getAll("grades") as string[];

  if (!title) {
    return { success: false, error: "Resource title is required." };
  }

  if (!topic) {
    return { success: false, error: "Please choose or enter a topic." };
  }

  const grades = gradesRaw
    .map((g) => parseInt(g, 10))
    .filter((g) => !isNaN(g) && g >= 1 && g <= 5);

  if (grades.length === 0) {
    return { success: false, error: "Please select at least one grade (1-5)." };
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { success: false, error: "Please attach a teaching resource file (PDF, Doc, Slides, or Image)." };
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const validation = validateFile(buffer, file.type, file.name);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  const uploadResult = await uploadResourceFile(buffer, file.name, file.type);

  await connectToDatabase();

  const newResource = await Resource.create({
    title,
    description,
    grades,
    topic,
    type,
    tags,
    instructions,
    publicationStatus,
    storageProvider: uploadResult.provider,
    storageKey: uploadResult.storageKey,
    safeFileName: sanitizeFileName(file.name),
    fileSize: uploadResult.size,
    mimeType: uploadResult.mimeType,
    teacherId: teacher.userId,
    teacherName: teacher.name,
    publishedAt: publicationStatus === "published" ? new Date() : undefined,
  });

  await Activity.create({
    action: publicationStatus === "published" ? "RESOURCE_PUBLISHED" : "RESOURCE_CREATED",
    actorId: teacher.userId,
    actorName: teacher.name,
    actorRole: "teacher",
    details: `Created resource "${title}" for Grade(s) ${grades.join(", ")} (${publicationStatus})`,
    resourceId: newResource._id,
  });

  revalidatePath("/teacher");
  revalidatePath("/student");

  return { success: true, resourceId: newResource._id.toString() };
}

/**
 * Update an existing resource.
 * Strictly teacher-only action.
 */
export async function updateResourceAction(
  resourceId: string,
  prevState: ResourceActionResult | null,
  formData: FormData
): Promise<ResourceActionResult> {
  const teacher = await requireTeacher();

  await connectToDatabase();
  const resource = await Resource.findById(resourceId);
  if (!resource) {
    return { success: false, error: "Resource not found." };
  }

  const title = (formData.get("title") as string || "").trim();
  const description = (formData.get("description") as string || "").trim();
  const topic = (formData.get("topic") as string || "").trim();
  const type = (formData.get("type") as ResourceType) || resource.type;
  const instructions = (formData.get("instructions") as string || "").trim();
  const publicationStatus = (formData.get("publicationStatus") as PublicationStatus) || resource.publicationStatus;
  const tagsRaw = (formData.get("tags") as string || "");
  const gradesRaw = formData.getAll("grades") as string[];

  if (!title) {
    return { success: false, error: "Title is required." };
  }

  if (!topic) {
    return { success: false, error: "Topic is required." };
  }

  const grades = gradesRaw
    .map((g) => parseInt(g, 10))
    .filter((g) => !isNaN(g) && g >= 1 && g <= 5);

  if (grades.length === 0) {
    return { success: false, error: "At least one grade must be selected." };
  }

  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  const file = formData.get("file") as File | null;
  if (file && file.size > 0) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const validation = validateFile(buffer, file.type, file.name);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Delete old file from object storage
    await deleteResourceFile(resource.storageKey, resource.storageProvider);

    // Upload new file
    const uploadResult = await uploadResourceFile(buffer, file.name, file.type);
    resource.storageKey = uploadResult.storageKey;
    resource.storageProvider = uploadResult.provider;
    resource.safeFileName = sanitizeFileName(file.name);
    resource.fileSize = uploadResult.size;
    resource.mimeType = uploadResult.mimeType;
  }

  resource.title = title;
  resource.description = description;
  resource.grades = grades;
  resource.topic = topic;
  resource.type = type;
  resource.tags = tags;
  resource.instructions = instructions;

  if (resource.publicationStatus !== publicationStatus) {
    resource.publicationStatus = publicationStatus;
    if (publicationStatus === "published") {
      resource.publishedAt = new Date();
    }
  }

  await resource.save();

  await Activity.create({
    action: "RESOURCE_UPDATED",
    actorId: teacher.userId,
    actorName: teacher.name,
    actorRole: "teacher",
    details: `Updated resource "${title}" (Status: ${publicationStatus})`,
    resourceId: resource._id,
  });

  revalidatePath("/teacher");
  revalidatePath("/student");
  revalidatePath(`/teacher/resources/${resourceId}/edit`);
  revalidatePath(`/student/resources/${resourceId}`);

  return { success: true, resourceId: resource._id.toString() };
}

/**
 * Toggle publication status between published and draft.
 */
export async function togglePublicationAction(
  resourceId: string,
  newStatus: PublicationStatus
): Promise<{ success: boolean; error?: string }> {
  const teacher = await requireTeacher();

  await connectToDatabase();
  const resource = await Resource.findById(resourceId);
  if (!resource) {
    return { success: false, error: "Resource not found" };
  }

  resource.publicationStatus = newStatus;
  if (newStatus === "published") {
    resource.publishedAt = new Date();
  }
  await resource.save();

  await Activity.create({
    action: newStatus === "published" ? "RESOURCE_PUBLISHED" : "RESOURCE_UNPUBLISHED",
    actorId: teacher.userId,
    actorName: teacher.name,
    actorRole: "teacher",
    details: `${newStatus === "published" ? "Published" : "Unpublished"} "${resource.title}"`,
    resourceId: resource._id,
  });

  revalidatePath("/teacher");
  revalidatePath("/student");

  return { success: true };
}

/**
 * Permanently delete a resource and its remote stored file.
 */
export async function deleteResourceAction(
  resourceId: string
): Promise<{ success: boolean; error?: string }> {
  const teacher = await requireTeacher();

  await connectToDatabase();
  const resource = await Resource.findById(resourceId);
  if (!resource) {
    return { success: false, error: "Resource not found" };
  }

  // Delete remote file from object storage
  await deleteResourceFile(resource.storageKey, resource.storageProvider);

  await Resource.findByIdAndDelete(resourceId);

  await Activity.create({
    action: "RESOURCE_DELETED",
    actorId: teacher.userId,
    actorName: teacher.name,
    actorRole: "teacher",
    details: `Deleted resource "${resource.title}"`,
  });

  revalidatePath("/teacher");
  revalidatePath("/student");

  return { success: true };
}
