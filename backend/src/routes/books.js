import { Router } from "express";
import Book from "../models/Book.js";
import { adminOnly, authRequired } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { q, genre, featured } = req.query;
    const filter = {};

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { author: { $regex: q, $options: "i" } }
      ];
    }

    if (genre) {
      filter.genre = genre;
    }

    if (featured === "true") {
      filter.featured = true;
    }

    const books = await Book.find(filter).sort({ createdAt: -1 });
    return res.json(books);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.json(book);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/", authRequired, adminOnly, async (req, res) => {
  try {
    const book = await Book.create(req.body);
    return res.status(201).json(book);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.put("/:id", authRequired, adminOnly, async (req, res) => {
  try {
    const updated = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updated) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.json(updated);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", authRequired, adminOnly, async (req, res) => {
  try {
    const deleted = await Book.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.json({ message: "Book deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;
