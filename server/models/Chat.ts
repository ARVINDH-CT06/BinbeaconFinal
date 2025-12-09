import mongoose, { Schema, Document } from "mongoose";

export interface IChat extends Document {
  sender: mongoose.Types.ObjectId;  // who sent the message (User)
  receiver?: mongoose.Types.ObjectId; // for private chat
  group?: string; // group name (ex: "Residents", "Collectors", "All")
  message: string;
  createdAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User" },
    group: { type: String },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

export const Chat = mongoose.model<IChat>("Chat", ChatSchema);
