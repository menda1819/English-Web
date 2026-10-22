import mongoose, { Schema, Document, Model } from "mongoose";

export type UserRole = "teacher" | "student";
export type UserStatus = "active" | "inactive";

export interface IUser extends Document {
  name: string;
  email: string; // Used as the login identifier (or username-style email)
  passwordHash: string;
  role: UserRole;
  grade?: number; // Primary enrolled grade: 1 to 5 for students, optional for teacher
  avatar?: string; // fun avatar mascot for kids (e.g., 'sprout', 'bunny', 'bee', 'owl', 'fox')
  status: UserStatus;
  accessAllGrades?: boolean; // If true, teacher granted full access across all Grades 1-5
  allowedGrades?: number[]; // Additional or specific grades permitted by teacher
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email or student username is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["teacher", "student"],
      default: "student",
      required: true,
      index: true,
    },
    grade: {
      type: Number,
      min: 1,
      max: 5,
      required: function (this: IUser) {
        return this.role === "student";
      },
      index: true,
    },
    avatar: {
      type: String,
      default: "sprout",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
    accessAllGrades: {
      type: Boolean,
      default: false,
    },
    allowedGrades: {
      type: [Number],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation of model in Next.js Turbopack / HMR
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
