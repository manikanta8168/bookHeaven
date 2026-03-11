import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    surveyCompleted: { type: Boolean, default: false },
    surveyCouponCode: { type: String, default: "" },
    surveyCouponDiscount: { type: Number, default: 10 },
    surveyCouponUsed: { type: Boolean, default: false },
    surveyLastCompletedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
