import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  phone: string;
  password: string;
  role: "resident" | "collector" | "authority";
  house?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // plain for now
    role: {
      type: String,
      enum: ["resident", "collector", "authority"],
      required: true,
    },
    house: { type: Schema.Types.ObjectId, ref: "House", default: null },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
