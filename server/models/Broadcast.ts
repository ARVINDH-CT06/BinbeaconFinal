import mongoose, { Schema, Document } from "mongoose";

export interface IBroadcast extends Document {
  authority: mongoose.Types.ObjectId;   // which authority sent it
  message: string;                       // broadcast text
  createdAt: Date;
  updatedAt: Date;
}

const BroadcastSchema = new Schema<IBroadcast>(
  {
    authority: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

export const Broadcast = mongoose.model<IBroadcast>("Broadcast", BroadcastSchema);
