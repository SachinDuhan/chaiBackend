import mongoose, { Schema } from "mongoose";

const subsciptionSchema = new Schema(
  {
    subsciber: {
      type: Schema.Types.ObjectId, // one who is subscribing
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId, // the channel to whom user is subscribing
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Subscription = mongoose.model("Subscription", subsciptionSchema);
