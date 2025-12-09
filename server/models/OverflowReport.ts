import mongoose from "mongoose";

const OverflowReportSchema = new mongoose.Schema({
  resident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  overflowType: {
    type: String,
    required: true, // "general", "plastic", "sewage", etc.
  },
  location: {
    type: {
      type: String,
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: true, // [lng, lat]
    },
  },
  remarks: {
    type: String,
  },
  image: {
    type: Buffer,
  },
  status: {
    type: String,
    enum: ["pending", "resolved"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const OverflowReport = mongoose.model("OverflowReport", OverflowReportSchema);
