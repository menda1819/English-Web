import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITaskSubmission {
  studentId: mongoose.Types.ObjectId;
  studentName: string;
  studentGrade: number;
  studentAvatar?: string;
  status: "done" | "reviewed";
  submittedAt: Date;
  studentNote?: string;
  attachmentName?: string;
  attachmentStorageKey?: string;
  attachmentMimeType?: string;
  attachmentSize?: number;
  teacherFeedback?: string;
  teacherRating?: string;
  reviewedAt?: Date;
}

export interface ITask extends Document {
  title: string;
  description: string;
  targetType: "grade" | "student" | "all";
  targetGrade?: number; // 1 to 5
  targetStudentId?: mongoose.Types.ObjectId;
  targetStudentName?: string;
  dueDate?: Date;
  teacherId: mongoose.Types.ObjectId;
  teacherName: string;
  attachmentName?: string;
  attachmentStorageKey?: string;
  attachmentMimeType?: string;
  attachmentSize?: number;
  submissions: ITaskSubmission[];
  createdAt: Date;
  updatedAt: Date;
}

const TaskSubmissionSchema = new Schema<ITaskSubmission>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    studentGrade: {
      type: Number,
      required: true,
    },
    studentAvatar: {
      type: String,
      default: "sprout",
    },
    status: {
      type: String,
      enum: ["done", "reviewed"],
      default: "done",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    studentNote: {
      type: String,
      trim: true,
      default: "",
    },
    attachmentName: {
      type: String,
      trim: true,
    },
    attachmentStorageKey: {
      type: String,
      trim: true,
    },
    attachmentMimeType: {
      type: String,
      trim: true,
    },
    attachmentSize: {
      type: Number,
    },
    teacherFeedback: {
      type: String,
      trim: true,
      default: "",
    },
    teacherRating: {
      type: String,
      trim: true,
      default: "",
    },
    reviewedAt: {
      type: Date,
    },
  },
  { _id: false }
);

const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Task instructions/description is required"],
      trim: true,
    },
    targetType: {
      type: String,
      enum: ["grade", "student", "all"],
      default: "grade",
      required: true,
    },
    targetGrade: {
      type: Number,
      min: 1,
      max: 5,
    },
    targetStudentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    targetStudentName: {
      type: String,
      trim: true,
    },
    dueDate: {
      type: Date,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teacherName: {
      type: String,
      required: true,
    },
    attachmentName: {
      type: String,
      trim: true,
    },
    attachmentStorageKey: {
      type: String,
      trim: true,
    },
    attachmentMimeType: {
      type: String,
      trim: true,
    },
    attachmentSize: {
      type: Number,
    },
    submissions: {
      type: [TaskSubmissionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

TaskSchema.index({ targetType: 1, targetGrade: 1 });
TaskSchema.index({ targetStudentId: 1 });
TaskSchema.index({ createdAt: -1 });

const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);

export default Task;
