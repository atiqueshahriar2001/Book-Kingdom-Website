import Book from "../models/Book.js";
import asyncHandler from "../utils/asyncHandler.js";

const parsePositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const getBooks = asyncHandler(async (req, res) => {
  const {
    search = "",
    category,
    rating,
    featured,
    page = 1,
    limit = 8
  } = req.query;

  const query = {};
  const normalizedSearch = typeof search === "string" ? search.trim() : "";
  const normalizedCategory = typeof category === "string" ? category.trim() : category;
  const pageNumber = parsePositiveInteger(page, 1);
  const limitNumber = parsePositiveInteger(limit, 8);

  if (req.query.minPrice !== undefined || req.query.maxPrice !== undefined) {
    query.price = {};
    if (req.query.minPrice !== undefined) {
      const minPrice = Number(req.query.minPrice);
      if (Number.isNaN(minPrice) || minPrice < 0) {
        return res.status(400).json({ message: "Minimum price must be a valid non-negative number" });
      }
      query.price.$gte = minPrice;
    }
    if (req.query.maxPrice !== undefined) {
      const maxPrice = Number(req.query.maxPrice);
      if (Number.isNaN(maxPrice) || maxPrice < 0) {
        return res.status(400).json({ message: "Maximum price must be a valid non-negative number" });
      }
      query.price.$lte = maxPrice;
    }
    if (query.price.$gte !== undefined && query.price.$lte !== undefined && query.price.$gte > query.price.$lte) {
      return res.status(400).json({ message: "Minimum price cannot be greater than maximum price" });
    }
  }

  if (normalizedSearch) {
    const escaped = normalizedSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { title: { $regex: escaped, $options: "i" } },
      { author: { $regex: escaped, $options: "i" } }
    ];
  }

  if (normalizedCategory && normalizedCategory !== "All") {
    query.category = normalizedCategory;
  }

  if (rating) {
    const minRating = Number(rating);
    if (Number.isNaN(minRating) || minRating < 0 || minRating > 5) {
      return res.status(400).json({ message: "Rating filter must be a number between 0 and 5" });
    }
    query.rating = { $gte: minRating };
  }

  if (featured === "true") {
    query.featured = true;
  }

  const skip = (pageNumber - 1) * limitNumber;
  const [books, total] = await Promise.all([
    Book.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNumber),
    Book.countDocuments(query)
  ]);

  return res.json({
    books,
    total,
    page: pageNumber,
    pages: Math.max(1, Math.ceil(total / limitNumber))
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
  const normalizedComment = typeof comment === "string" ? comment.trim() : "";
  const book = await Book.findById(req.params.id);

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!rating || !normalizedComment) {
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
    comment: normalizedComment
  });

  book.numReviews = book.reviews.length;
  book.rating =
    book.reviews.reduce((sum, review) => sum + review.rating, 0) / book.reviews.length;

  await book.save();
  return res.status(201).json({ message: "Review added" });
});
