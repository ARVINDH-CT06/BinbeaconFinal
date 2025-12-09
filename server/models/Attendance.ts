import mongoose, { Schema, Document } from "mongoose";

export interface IAttendance extends Document {
  collector: mongoose.Types.ObjectId;   // collector user
  date: string;                         // "2025-11-25"
  checkInTime?: Date;
  checkOutTime?: Date;
  status: "present" | "absent" | "half-day";
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    collector: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true },
    checkInTime: { type: Date },
    checkOutTime: { type: Date },
    status: {
      type: String,
      enum: ["present", "absent", "half-day"],
      required: true,
      default: "present",
    },
  },
  { timestamps: true }
);

// Ensure no duplicate attendance for the same day
AttendanceSchema.index({ collector: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model<IAttendance>(
  "Attendance",
  AttendanceSchema
);
