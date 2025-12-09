import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema(
  {
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    rating: {
      type: Number, // 1–5 star feedback
      required: true,
    }
  },
  { timestamps: true }
);

export const Feedback = mongoose.model("Feedback", FeedbackSchema);
