import mongoose, { Schema, Document } from "mongoose";

export interface IHouse extends Document {
  wardNumber?: string;
  houseNumber?: string;
  houseId?: string;
  address?: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  createdAt: Date;
  updatedAt: Date;
}

const HouseSchema = new Schema<IHouse>(
  {
    wardNumber: { type: String, default: "UNKNOWN" },
    houseNumber: { type: String, default: "UNKNOWN" },
    houseId: { type: String, default: "UNKNOWN" },
    address: { type: String, default: "Not provided" },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        // we’ll default to [0,0] so it's never "required" error
        default: [0, 0],
      },
    },
  },
  { timestamps: true }
);

export const House = mongoose.model<IHouse>("House", HouseSchema);
