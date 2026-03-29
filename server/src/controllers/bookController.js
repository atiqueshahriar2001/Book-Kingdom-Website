import Book from "../models/Book.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getBooks = asyncHandler(async (req, res) => {
  const {
    search = "",
    category,
    minPrice = 0,
    maxPrice = Number.MAX_SAFE_INTEGER,
    rating,
    featured,
    page = 1,
    limit = 8
  } = req.query;

  const query = {
    price: { $gte: Number(minPrice), $lte: Number(maxPrice) }
  };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { author: { $regex: search, $options: "i" } }
    ];
  }

  if (category && category !== "All") {
    query.category = category;
  }

  if (rating) {
    query.rating = { $gte: Number(rating) };
  }

  if (featured === "true") {
    query.featured = true;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [books, total] = await Promise.all([
    Book.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Book.countDocuments(query)
  ]);

  return res.json({
    books,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit))
  });
});

export const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.json(book);
});

export const createBookReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const book = await Book.findById(req.params.id);

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!rating || !comment) {
    return res.status(400).json({ message: "Rating and comment are required" });
  }

  const numRating = Number(rating);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  const alreadyReviewed = book.reviews.find(
    (review) => review.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    return res.status(400).json({ message: "You already reviewed this book" });
  }

  book.reviews.push({
    user: req.user._id,
    name: req.user.name,
    rating: numRating,
    comment
  });

  book.numReviews = book.reviews.length;
  book.rating =
    book.reviews.reduce((sum, review) => sum + review.rating, 0) / book.reviews.length;

  await book.save();
  return res.status(201).json({ message: "Review added" });
});
