import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import mongoose from "mongoose";
import { GridFSBucket, ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/db";

// Configure Cloudinary if environment variables are provided
const hasCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export interface StorageUploadResult {
  storageKey: string;
  provider: "cloudinary" | "mongodb-gridfs";
  publicUrl?: string;
  size: number;
  mimeType: string;
}

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

/**
 * Sanitize filename to prevent directory traversal and executable attacks
 */
export function sanitizeFileName(name: string): string {
  // Strip paths
  const base = name.replace(/^.*[\\\/]/, "");
  // Replace unsafe chars
  const sanitized = base.replace(/[^a-zA-Z0-9._-]/g, "_");
  // Prevent dangerous executable extensions
  const dangerousExtensions = [".exe", ".bat", ".cmd", ".sh", ".js", ".mjs", ".ts", ".php", ".py", ".html", ".htm"];
  for (const ext of dangerousExtensions) {
    if (sanitized.toLowerCase().endsWith(ext)) {
      return sanitized + ".txt";
    }
  }
  return sanitized || "document.pdf";
}

/**
 * Validate file type and size
 */
export function validateFile(buffer: Buffer, mimeType: string, filename: string): { valid: boolean; error?: string } {
  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds maximum limit of ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB`,
    };
  }

  // Normalize mime type
  const lowerMime = mimeType.toLowerCase();
  const lowerName = filename.toLowerCase();

  const isAllowedMime = ALLOWED_MIME_TYPES.includes(lowerMime);
  const hasAllowedExt = [
    ".pdf",
    ".doc",
    ".docx",
    ".ppt",
    ".pptx",
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
    ".svg",
  ].some((ext) => lowerName.endsWith(ext));

  if (!isAllowedMime || !hasAllowedExt) {
    return {
      valid: false,
      error: "Only PDF, Word (.doc, .docx), PowerPoint (.ppt, .pptx), and Images (JPG, PNG, WebP, GIF, SVG) are permitted.",
    };
  }

  return { valid: true };
}

/**
 * Upload a resource file to persistent remote object storage.
 * Defaults to Cloudinary when configured, otherwise uses remote MongoDB GridFS on Atlas.
 */
export async function uploadResourceFile(
  fileBuffer: Buffer,
  originalFilename: string,
  mimeType: string
): Promise<StorageUploadResult> {
  const safeName = sanitizeFileName(originalFilename);

  if (hasCloudinary) {
    try {
      const isRaw = !mimeType.startsWith("image/");
      const resourceType = isRaw ? "raw" : "image";

      const uploadResult = await new Promise<{ public_id: string; secure_url: string; bytes: number }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "bright_english_garden",
            resource_type: resourceType,
            public_id: `${Date.now()}_${safeName.replace(/\.[^/.]+$/, "")}`,
          },
          (error, result) => {
            if (error || !result) {
              reject(error || new Error("Cloudinary upload failed with empty result"));
            } else {
              resolve(result);
            }
          }
        );
        Readable.from(fileBuffer).pipe(stream);
      });

      return {
        storageKey: uploadResult.public_id,
        provider: "cloudinary",
        publicUrl: uploadResult.secure_url,
        size: uploadResult.bytes || fileBuffer.length,
        mimeType,
      };
    } catch (cloudinaryError) {
      console.warn("Cloudinary upload failed, falling back to MongoDB GridFS remote storage:", cloudinaryError);
      // Fall through to Mongo GridFS
    }
  }

  // MongoDB GridFS Remote Object Storage (Atlas)
  await connectToDatabase();
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("MongoDB connection not ready for GridFS storage");
  }

  const bucket = new GridFSBucket(db, { bucketName: "educational_materials" });

  const uploadStream = bucket.openUploadStream(safeName, {
    metadata: {
      contentType: mimeType,
      originalName: originalFilename,
      uploadedAt: new Date(),
    },
  });

  await new Promise<void>((resolve, reject) => {
    Readable.from(fileBuffer)
      .pipe(uploadStream)
      .on("error", reject)
      .on("finish", () => resolve());
  });

  return {
    storageKey: uploadStream.id.toString(),
    provider: "mongodb-gridfs",
    size: fileBuffer.length,
    mimeType,
  };
}

/**
 * Retrieve file buffer from storage provider for secure streaming
 */
export async function downloadResourceFile(
  storageKey: string,
  provider: "cloudinary" | "mongodb-gridfs",
  mimeType: string
): Promise<Buffer> {
  if (provider === "cloudinary") {
    // When using Cloudinary, fetch the secure resource buffer
    const isRaw = !mimeType.startsWith("image/");
    const resourceType = isRaw ? "raw" : "image";
    const downloadUrl = cloudinary.url(storageKey, {
      resource_type: resourceType,
      secure: true,
    });

    const res = await fetch(downloadUrl);
    if (!res.ok) {
      throw new Error(`Failed to fetch file from Cloudinary (HTTP ${res.status})`);
    }
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  // MongoDB GridFS
  await connectToDatabase();
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Database not connected for file retrieval");
  }

  const bucket = new GridFSBucket(db, { bucketName: "educational_materials" });
  const objectId = new ObjectId(storageKey);

  const downloadStream = bucket.openDownloadStream(objectId);
  const chunks: Buffer[] = [];

  return new Promise<Buffer>((resolve, reject) => {
    downloadStream.on("data", (chunk: Buffer) => chunks.push(chunk));
    downloadStream.on("error", reject);
    downloadStream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

/**
 * Delete file from storage provider
 */
export async function deleteResourceFile(
  storageKey: string,
  provider: "cloudinary" | "mongodb-gridfs"
): Promise<boolean> {
  try {
    if (provider === "cloudinary") {
      await cloudinary.uploader.destroy(storageKey, { invalidate: true });
      return true;
    }

    // MongoDB GridFS
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) return false;

    const bucket = new GridFSBucket(db, { bucketName: "educational_materials" });
    const objectId = new ObjectId(storageKey);
    await bucket.delete(objectId);
    return true;
  } catch (err) {
    console.error("Error deleting file from storage:", err);
    return false;
  }
}

/**
 * Upload a user profile picture to MongoDB GridFS in the 'user_avatars' bucket
 */
export async function uploadAvatarFile(
  fileBuffer: Buffer,
  originalFilename: string,
  mimeType: string
): Promise<string> {
  await connectToDatabase();
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("MongoDB connection not ready for avatar storage");
  }

  const bucket = new GridFSBucket(db, { bucketName: "user_avatars" });
  const safeName = sanitizeFileName(originalFilename);

  const uploadStream = bucket.openUploadStream(safeName, {
    metadata: {
      contentType: mimeType,
      originalName: originalFilename,
      uploadedAt: new Date(),
    },
  });

  await new Promise<void>((resolve, reject) => {
    Readable.from(fileBuffer)
      .pipe(uploadStream)
      .on("error", reject)
      .on("finish", () => resolve());
  });

  return uploadStream.id.toString();
}

/**
 * Retrieve user avatar file buffer and mimeType from GridFS
 */
export async function downloadAvatarFile(
  fileId: string
): Promise<{ buffer: Buffer; mimeType: string } | null> {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) return null;

    const bucket = new GridFSBucket(db, { bucketName: "user_avatars" });
    let objectId: ObjectId;
    try {
      objectId = new ObjectId(fileId);
    } catch {
      return null;
    }

    const files = await bucket.find({ _id: objectId }).toArray();
    if (!files || files.length === 0) {
      return null;
    }

    const mimeType = (files[0].metadata as Record<string, any>)?.contentType || "image/jpeg";
    const downloadStream = bucket.openDownloadStream(objectId);
    const chunks: Buffer[] = [];

    const buffer = await new Promise<Buffer>((resolve, reject) => {
      downloadStream.on("data", (chunk: Buffer) => chunks.push(chunk));
      downloadStream.on("error", reject);
      downloadStream.on("end", () => resolve(Buffer.concat(chunks)));
    });

    return { buffer, mimeType };
  } catch (err) {
    console.error("Error retrieving avatar file:", err);
    return null;
  }
}

/**
 * Delete previous avatar file from GridFS to free storage
 */
export async function deleteAvatarFile(fileId: string): Promise<boolean> {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) return false;

    const bucket = new GridFSBucket(db, { bucketName: "user_avatars" });
    const objectId = new ObjectId(fileId);
    await bucket.delete(objectId);
    return true;
  } catch {
    return false;
  }
}
