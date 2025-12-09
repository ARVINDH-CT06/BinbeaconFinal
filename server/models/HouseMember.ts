import mongoose, { Schema, Document } from "mongoose";

export interface IHouseMember extends Document {
  house: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  relation: string; // father, mother, son, daughter, tenant, etc.
  isPrimary: boolean; // first person registered → primary resident
  createdAt: Date;
  updatedAt: Date;
}

const HouseMemberSchema = new Schema<IHouseMember>(
  {
    house: { type: Schema.Types.ObjectId, ref: "House", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    relation: { type: String, default: "member" },
    isPrimary: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// A user cannot join the same house twice
HouseMemberSchema.index({ house: 1, user: 1 }, { unique: true });

export const HouseMember = mongoose.model<IHouseMember>(
  "HouseMember",
  HouseMemberSchema
);
