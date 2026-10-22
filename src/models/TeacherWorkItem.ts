import mongoose, { Schema, Document, Model } from "mongoose";

export type TeacherWorkCategory =
  | "todo"
  | "lesson_plan"
  | "exam"
  | "marks"
  | "notes";

export type TeacherWorkPriority = "low" | "medium" | "high" | "urgent";
export type TeacherWorkStatus = "pending" | "in_progress" | "completed";

export interface ITeacherWorkItem extends Document {
  teacherId: mongoose.Types.ObjectId;
  title: string;
  category: TeacherWorkCategory;
  priority: TeacherWorkPriority;
  status: TeacherWorkStatus;
  targetGrade?: number | null; // 1-5 or null for all / general
  dueDate?: Date | null;
  reminderDate?: Date | null;
  notes?: string;
  isPinned: boolean;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const TeacherWorkItemSchema = new Schema<ITeacherWorkItem>(
  {
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    category: {
      type: String,
      enum: ["todo", "lesson_plan", "exam", "marks", "notes"],
      default: "todo",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
      index: true,
    },
    targetGrade: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    reminderDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

TeacherWorkItemSchema.index({ teacherId: 1, isPinned: -1, dueDate: 1 });
TeacherWorkItemSchema.index({ teacherId: 1, category: 1, status: 1 });

const TeacherWorkItem: Model<ITeacherWorkItem> =
  mongoose.models.TeacherWorkItem ||
  mongoose.model<ITeacherWorkItem>("TeacherWorkItem", TeacherWorkItemSchema);

export default TeacherWorkItem;
