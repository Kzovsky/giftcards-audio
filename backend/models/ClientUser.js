import mongoose from "mongoose";

const clientUserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, required: false },
    role: { type: String, enum: ["user"], default: "user" },
  },
  { timestamps: true }
);

export default mongoose.model("ClientUser", clientUserSchema);
