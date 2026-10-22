import mongoose, { Schema, Document, Model } from "mongoose";

export type ActivityAction =
  | "RESOURCE_CREATED"
  | "RESOURCE_UPDATED"
  | "RESOURCE_PUBLISHED"
  | "RESOURCE_UNPUBLISHED"
  | "RESOURCE_DELETED"
  | "STUDENT_REGISTERED"
  | "STUDENT_STATUS_CHANGED"
  | "STUDENT_PERMISSIONS_CHANGED"
  | "PROFILE_UPDATED"
  | "PASSWORD_CHANGED";

export interface IActivity extends Document {
  action: ActivityAction;
  actorId: mongoose.Types.ObjectId;
  actorName: string;
  actorRole: string;
  details: string;
  resourceId?: mongoose.Types.ObjectId;
  targetUserId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    action: {
      type: String,
      required: true,
      index: true,
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    actorName: {
      type: String,
      required: true,
    },
    actorRole: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      required: true,
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      ref: "Resource",
    },
    targetUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

ActivitySchema.index({ createdAt: -1 });

const Activity: Model<IActivity> =
  mongoose.models.Activity || mongoose.model<IActivity>("Activity", ActivitySchema);

export default Activity;
