import Book from "../models/Book.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { BOOK_CATEGORIES, isValidBookCategory } from "../constants/bookCategories.js";
import asyncHandler from "../utils/asyncHandler.js";

const parsePositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const parseDateValue = (value, label) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    const error = new Error(`${label} must be a valid date`);
    error.statusCode = 400;
    throw error;
  }
  return parsed;
};

const ORDER_STATUS_TRANSITIONS = {
  Pending: ["Shipped", "Cancelled"],
  Shipped: ["Delivered", "Cancelled"],
  Delivered: [],
  Cancelled: []
};

export const getDashboardStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const dateFilter = {};
  const parsedStartDate = parseDateValue(startDate, "startDate");
  const parsedEndDate = parseDateValue(endDate, "endDate");
  if (parsedStartDate) dateFilter.$gte = parsedStartDate;
  if (parsedEndDate) dateFilter.$lte = parsedEndDate;

  const orderMatch = Object.keys(dateFilter).length ? { createdAt: dateFilter } : {};

  const [users, books, orderAgg] = await Promise.all([
    User.countDocuments(),
    Book.countDocuments(),
    Order.aggregate([
      { $match: orderMatch },
      { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: "$totalPrice" } } }
    ])
  ]);

  const orderStats = orderAgg[0] || { count: 0, revenue: 0 };

  return res.json({
    users,
    books,
    orders: orderStats.count,
    revenue: orderStats.revenue
  });
});

export const getAdminBooks = asyncHandler(async (req, res) => {
  const { search = "", page = 1, limit = 10 } = req.query;
  const pageNumber = parsePositiveInteger(page, 1);
  const limitNumber = parsePositiveInteger(limit, 10);

  const query = {};
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { title: { $regex: escaped, $options: "i" } },
      { author: { $regex: escaped, $options: "i" } }
    ];
  }

  const skip = (pageNumber - 1) * limitNumber;
  const [books, total] = await Promise.all([
    Book.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNumber),
    Book.countDocuments(query)
  ]);

  return res.json({ books, total, page: pageNumber, pages: Math.max(1, Math.ceil(total / limitNumber)) });
});

export const createBook = asyncHandler(async (req, res) => {
  const { title, author, category, description, price, countInStock, featured } = req.body;
  const normalizedTitle = typeof title === "string" ? title.trim() : "";
  const normalizedAuthor = typeof author === "string" ? author.trim() : "";
  const normalizedCategory = typeof category === "string" ? category.trim() : "";
  const normalizedDescription = typeof description === "string" ? description.trim() : "";

  if (!normalizedTitle || !normalizedAuthor || !normalizedCategory || !normalizedDescription || price == null) {
    return res.status(400).json({ message: "Title, author, category, description, and price are required" });
  }
  if (!isValidBookCategory(normalizedCategory)) {
    return res.status(400).json({ message: `Category must be one of: ${BOOK_CATEGORIES.join(", ")}` });
  }

  const parsedPrice = Number(price);
  const parsedStock = Number(countInStock ?? 0);
  if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({ message: "Price must be a valid non-negative number" });
  }
  if (!Number.isInteger(parsedStock) || parsedStock < 0) {
    return res.status(400).json({ message: "Stock must be a valid non-negative whole number" });
  }
  if (!req.file?.cloudinaryUrl) {
    return res.status(400).json({ message: "Book cover image is required" });
  }

  const data = {
    title: normalizedTitle,
    author: normalizedAuthor,
    category: normalizedCategory,
    description: normalizedDescription,
    price: parsedPrice,
    countInStock: parsedStock,
    featured: featured === "true" || featured === true
  };

  data.image = req.file.cloudinaryUrl;

  const book = await Book.create(data);
  return res.status(201).json(book);
});

export const updateBook = asyncHandler(async (req, res) => {
  const { title, author, category, description, price, countInStock, featured } = req.body;

  const book = await Book.findById(req.params.id);
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (title !== undefined) {
    const normalizedTitle = typeof title === "string" ? title.trim() : "";
    if (!normalizedTitle) {
      return res.status(400).json({ message: "Title cannot be empty" });
    }
    book.title = normalizedTitle;
  }
  if (author !== undefined) {
    const normalizedAuthor = typeof author === "string" ? author.trim() : "";
    if (!normalizedAuthor) {
      return res.status(400).json({ message: "Author cannot be empty" });
    }
    book.author = normalizedAuthor;
  }
  if (category !== undefined) {
    const normalizedCategory = typeof category === "string" ? category.trim() : "";
    if (!normalizedCategory) {
      return res.status(400).json({ message: "Category cannot be empty" });
    }
    if (!isValidBookCategory(normalizedCategory)) {
      return res.status(400).json({ message: `Category must be one of: ${BOOK_CATEGORIES.join(", ")}` });
    }
    book.category = normalizedCategory;
  }
  if (description !== undefined) {
    const normalizedDescription = typeof description === "string" ? description.trim() : "";
    if (!normalizedDescription) {
      return res.status(400).json({ message: "Description cannot be empty" });
    }
    book.description = normalizedDescription;
  }
  if (price !== undefined) {
    const parsedPrice = Number(price);
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ message: "Price must be a valid non-negative number" });
    }
    book.price = parsedPrice;
  }
  if (countInStock !== undefined) {
    const parsedStock = Number(countInStock);
    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      return res.status(400).json({ message: "Stock must be a valid non-negative whole number" });
    }
    book.countInStock = parsedStock;
  }
  if (featured !== undefined) book.featured = featured === "true" || featured === true;

  if (req.file?.cloudinaryUrl) {
    book.image = req.file.cloudinaryUrl;
  }

  await book.save();
  return res.json(book);
});

export const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findByIdAndDelete(req.params.id);
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.json({ message: "Book deleted" });
});

export const getUsers = asyncHandler(async (req, res) => {
  const { search = "", role, page = 1, limit = 10 } = req.query;
  const pageNumber = parsePositiveInteger(page, 1);
  const limitNumber = parsePositiveInteger(limit, 10);

  const query = {};
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { name: { $regex: escaped, $options: "i" } },
      { email: { $regex: escaped, $options: "i" } }
    ];
  }
  if (role && ["user", "admin"].includes(role)) {
    query.role = role;
  }

  const skip = (pageNumber - 1) * limitNumber;
  const [users, total] = await Promise.all([
    User.find(query).select("-password +role").sort({ createdAt: -1 }).skip(skip).limit(limitNumber),
    User.countDocuments(query)
  ]);

  return res.json({ users, total, page: pageNumber, pages: Math.max(1, Math.ceil(total / limitNumber)) });
});

export const getOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const pageNumber = parsePositiveInteger(page, 1);
  const limitNumber = parsePositiveInteger(limit, 10);

  const query = {};
  const validStatuses = ["Pending", "Shipped", "Delivered", "Cancelled"];
  if (status && validStatuses.includes(status)) {
    query.status = status;
  }

  const skip = (pageNumber - 1) * limitNumber;
  const [orders, total] = await Promise.all([
    Order.find(query).populate("user", "name email").sort({ createdAt: -1 }).skip(skip).limit(limitNumber),
    Order.countDocuments(query)
  ]);

  return res.json({ orders, total, page: pageNumber, pages: Math.max(1, Math.ceil(total / limitNumber)) });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["Pending", "Shipped", "Delivered", "Cancelled"];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(", ")}` });
  }

  const session = await Order.startSession();

  try {
    let updatedOrder;

    await session.withTransaction(async () => {
      const order = await Order.findById(req.params.id).session(session);
      if (!order) {
        const error = new Error("Order not found");
        error.statusCode = 404;
        throw error;
      }

      if (order.status === status) {
        updatedOrder = order;
        return;
      }

      const allowedNextStatuses = ORDER_STATUS_TRANSITIONS[order.status] || [];
      if (!allowedNextStatuses.includes(status)) {
        const error = new Error(`Cannot change order status from ${order.status} to ${status}`);
        error.statusCode = 400;
        throw error;
      }

      if (status === "Cancelled") {
        for (const item of order.orderItems) {
          await Book.updateOne(
            { _id: item.book },
            { $inc: { countInStock: item.quantity } },
            { session }
          );
        }
      }

      order.status = status;
      await order.save({ session });
      updatedOrder = order;
    });

    return res.json(updatedOrder);
  } finally {
    await session.endSession();
  }
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!role || !["user", "admin"].includes(role)) {
    return res.status(400).json({ message: "Role must be either 'user' or 'admin'" });
  }

  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ message: "You cannot change your own role" });
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.role = role;
  await user.save();
  return res.json({ message: "User role updated" });
});

export const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ message: "You cannot delete your own account" });
  }

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.json({ message: "User deleted" });
});
