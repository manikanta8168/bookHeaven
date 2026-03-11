import { Router } from "express";
import Book from "../models/Book.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { adminOnly, authRequired } from "../middleware/auth.js";

const router = Router();

router.post("/", authRequired, async (req, res) => {
  try {
    const { items, shippingAddress, couponCode } = req.body;

    if (!Array.isArray(items) || items.length === 0 || !shippingAddress) {
      return res.status(400).json({ message: "Invalid order payload" });
    }

    let couponUser = null;
    let discountPercent = 0;
    let appliedCouponCode = "";

    if (couponCode) {
      const normalizedCode = couponCode.trim().toUpperCase();
      couponUser = await User.findById(req.user.id).select(
        "surveyCouponCode surveyCouponDiscount surveyCouponUsed"
      );

      if (!couponUser || !couponUser.surveyCouponCode) {
        return res.status(400).json({ message: "Coupon is not available for this account" });
      }
      if (couponUser.surveyCouponUsed) {
        return res.status(400).json({ message: "Coupon already used" });
      }
      if (couponUser.surveyCouponCode.toUpperCase() !== normalizedCode) {
        return res.status(400).json({ message: "Invalid coupon code" });
      }

      discountPercent = Number(couponUser.surveyCouponDiscount || 0);
      appliedCouponCode = couponUser.surveyCouponCode;
    }

    const orderItems = [];
    let subtotalAmount = 0;

    for (const item of items) {
      const book = await Book.findById(item.bookId);
      if (!book) {
        return res.status(404).json({ message: `Book not found: ${item.bookId}` });
      }

      if (book.stock < item.quantity) {
        return res
          .status(400)
          .json({ message: `Insufficient stock for ${book.title}` });
      }

      book.stock -= item.quantity;
      await book.save();

      subtotalAmount += book.price * item.quantity;
      orderItems.push({
        book: book._id,
        title: book.title,
        price: book.price,
        quantity: item.quantity
      });
    }

    const discountAmount = (subtotalAmount * discountPercent) / 100;

    const totalAmount = Math.max(0, subtotalAmount - discountAmount);

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      subtotalAmount,
      discountAmount,
      discountPercent,
      couponCode: appliedCouponCode,
      totalAmount,
      status: "pending"
    });

    if (couponUser) {
      couponUser.surveyCouponUsed = true;
      await couponUser.save();
    }

    return res.status(201).json(order);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/mine", authRequired, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.delete("/mine", authRequired, async (req, res) => {
  try {
    const result = await Order.deleteMany({ user: req.user.id });
    return res.json({
      message: "Order history cleared",
      deletedCount: result.deletedCount || 0
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/", authRequired, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.patch("/:id/status", authRequired, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "paid", "shipped", "delivered", "cancelled"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.patch("/:id/cancel", authRequired, async (req, res) => {
  try {
    const reason = (req.body?.reason || "").trim();
    if (!reason) {
      return res.status(400).json({ message: "Cancellation reason is required" });
    }

    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!["pending", "paid"].includes(order.status)) {
      return res.status(400).json({ message: "This order can no longer be cancelled" });
    }

    for (const item of order.items) {
      const book = await Book.findById(item.book);
      if (book) {
        book.stock += item.quantity;
        await book.save();
      }
    }

    order.status = "cancelled";
    order.cancelReason = reason;
    order.canceledAt = new Date();
    await order.save();

    return res.json(order);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;
