import mongoose from "mongoose";

const giftLinkSchema = new mongoose.Schema(
  {
    linkId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["PENDING_VALIDATION", "VALIDATED", "RECORDED", "REVOKED"],
      default: "PENDING_VALIDATION",
    },
    audioUrl: {
      type: String,
      default: null,
    },
    recordedAt: {
      type: Date,
      default: null,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("GiftLink", giftLinkSchema);
