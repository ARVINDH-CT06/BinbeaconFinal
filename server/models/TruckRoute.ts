import mongoose, { Schema, Document } from "mongoose";

export interface ITruckRoute extends Document {
  date: string;                                // example: "2025-11-25"
  wardNumber: string;                          // which area the route covers
  collector: mongoose.Types.ObjectId;          // assigned collector
  path: {
    type: "LineString";
    coordinates: [number, number][];           // multiple [lng, lat] points
  };
  currentIndex: number;                        // for live tracking simulation
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TruckRouteSchema = new Schema<ITruckRoute>(
  {
    date: { type: String, required: true },
    wardNumber: { type: String, required: true },
    collector: { type: Schema.Types.ObjectId, ref: "User", required: true },
    path: {
      type: {
        type: String,
        enum: ["LineString"],
        default: "LineString",
      },
      coordinates: {
        type: [[Number]], // array of [lng, lat]
        required: true,
      },
    },
    currentIndex: { type: Number, default: 0 },
    startedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

TruckRouteSchema.index({ path: "2dsphere" });

export const TruckRoute = mongoose.model<ITruckRoute>(
  "TruckRoute",
  TruckRouteSchema
);
