import mongoose, { Schema, Document, Model } from "mongoose";

export type ResourceType =
  | "worksheet"
  | "lesson-plan"
  | "notes"
  | "exam-paper"
  | "revision"
  | "document"
  | "activity";

export type PublicationStatus = "draft" | "published";

export interface IResource extends Document {
  title: string;
  description: string;
  grades: number[]; // e.g. [1, 2] or [3]
  topic: string;
  type: ResourceType;
  tags: string[];
  instructions?: string;
  publicationStatus: PublicationStatus;
  storageProvider: "cloudinary" | "mongodb-gridfs";
  storageKey: string;
  safeFileName: string;
  fileSize: number;
  mimeType: string;
  teacherId: mongoose.Types.ObjectId;
  teacherName: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    grades: {
      type: [Number],
      required: [true, "At least one grade must be selected"],
      validate: {
        validator: function (v: number[]) {
          return Array.isArray(v) && v.length > 0 && v.every((g) => g >= 1 && g <= 5);
        },
        message: "Grades must be between 1 and 5",
      },
      index: true,
    },
    topic: {
      type: String,
      required: [true, "Topic is required"],
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "worksheet",
        "lesson-plan",
        "notes",
        "exam-paper",
        "revision",
        "document",
        "activity",
      ],
      default: "worksheet",
      required: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    instructions: {
      type: String,
      trim: true,
      default: "",
    },
    publicationStatus: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      required: true,
      index: true,
    },
    storageProvider: {
      type: String,
      enum: ["cloudinary", "mongodb-gridfs"],
      required: true,
    },
    storageKey: {
      type: String,
      required: true,
    },
    safeFileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    teacherName: {
      type: String,
      required: true,
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast filtered lookups
ResourceSchema.index({ publicationStatus: 1, grades: 1 });
ResourceSchema.index({ publicationStatus: 1, topic: 1 });
ResourceSchema.index({ publicationStatus: 1, type: 1 });
ResourceSchema.index({ publicationStatus: 1, createdAt: -1 });

const Resource: Model<IResource> =
  mongoose.models.Resource || mongoose.model<IResource>("Resource", ResourceSchema);

export default Resource;
