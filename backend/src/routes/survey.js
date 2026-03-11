import { Router } from "express";
import User from "../models/User.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

const generateCouponCode = () => {
  const token = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `READ10-${token}`;
};

const toDayKey = (date) => date.toISOString().slice(0, 10);

router.post("/complete", authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const todayKey = toDayKey(new Date());
    const lastKey = user.surveyLastCompletedAt ? toDayKey(user.surveyLastCompletedAt) : "";

    if (lastKey === todayKey) {
      return res.json({
        message: "Survey already completed today. You can take it again tomorrow.",
        couponCode: user.surveyCouponCode,
        discountPercent: user.surveyCouponDiscount,
        used: user.surveyCouponUsed,
        surveyLastCompletedAt: user.surveyLastCompletedAt
      });
    }

    user.surveyCompleted = true;
    user.surveyCouponCode = generateCouponCode();
    user.surveyCouponDiscount = 10;
    user.surveyCouponUsed = false;
    user.surveyLastCompletedAt = new Date();
    await user.save();

    return res.json({
      message: "Survey completed. New daily coupon issued.",
      couponCode: user.surveyCouponCode,
      discountPercent: user.surveyCouponDiscount,
      used: user.surveyCouponUsed,
      surveyLastCompletedAt: user.surveyLastCompletedAt
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/my-coupon", authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "surveyCompleted surveyCouponCode surveyCouponDiscount surveyCouponUsed surveyLastCompletedAt"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      surveyCompleted: user.surveyCompleted,
      couponCode: user.surveyCouponCode || "",
      discountPercent: user.surveyCouponDiscount || 0,
      used: Boolean(user.surveyCouponUsed),
      surveyLastCompletedAt: user.surveyLastCompletedAt
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/validate", authRequired, async (req, res) => {
  try {
    const inputCode = (req.body?.code || "").trim().toUpperCase();
    if (!inputCode) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const user = await User.findById(req.user.id).select(
      "surveyCouponCode surveyCouponDiscount surveyCouponUsed"
    );
    if (!user || !user.surveyCouponCode) {
      return res.status(404).json({ message: "No coupon found for this user" });
    }

    if (user.surveyCouponUsed) {
      return res.status(400).json({ message: "Coupon already used" });
    }

    if (user.surveyCouponCode.toUpperCase() !== inputCode) {
      return res.status(400).json({ message: "Invalid coupon code" });
    }

    return res.json({
      valid: true,
      couponCode: user.surveyCouponCode,
      discountPercent: user.surveyCouponDiscount
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;
