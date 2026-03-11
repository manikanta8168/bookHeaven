import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: { type: String, default: "" },
    genre: { type: String, default: "General" },
    image: { type: String, default: "" },
    pages: { type: Number, min: 1, default: null },
    language: { type: String, default: "English" },
    publisher: { type: String, default: "" },
    publishedYear: { type: Number, min: 0, default: null },
    isbn: { type: String, default: "" },
    price: { type: Number, required: true, min: 300, max: 500 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    featured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Book = mongoose.model("Book", bookSchema);

export default Book;
