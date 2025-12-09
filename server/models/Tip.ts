import mongoose, { Schema, Document } from "mongoose";

export interface ITip extends Document {
  fromResident: mongoose.Types.ObjectId;     // user who tipped
  toCollector: mongoose.Types.ObjectId;      // collector user who receives
  house: mongoose.Types.ObjectId;            // house of the resident
  amount: number;                            // ex: 10, 50, 100
  message?: string;                          // optional thank you note
  createdAt: Date;
  updatedAt: Date;
}

const TipSchema = new Schema<ITip>(
  {
    fromResident: { type: Schema.Types.ObjectId, ref: "User", required: true },
    toCollector: { type: Schema.Types.ObjectId, ref: "User", required: true },
    house: { type: Schema.Types.ObjectId, ref: "House", required: true },
    amount: { type: Number, required: true, default: 0 },
    message: { type: String },
  },
  { timestamps: true }
);

export const Tip = mongoose.model<ITip>("Tip", TipSchema);
