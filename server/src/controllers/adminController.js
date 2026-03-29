import Book from "../models/Book.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  const orderQuery = Object.keys(dateFilter).length ? { createdAt: dateFilter } : {};

  const [users, books, orders] = await Promise.all([
    User.countDocuments(),
    Book.countDocuments(),
    Order.find(orderQuery)
  ]);

  return res.json({
    users,
    books,
    orders: orders.length,
    revenue: orders.reduce((sum, order) => sum + order.totalPrice, 0)
  });
});

export const getAdminBooks = asyncHandler(async (req, res) => {
  const { search = "", page = 1, limit = 10 } = req.query;

  const query = {};
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { title: { $regex: escaped, $options: "i" } },
      { author: { $regex: escaped, $options: "i" } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [books, total] = await Promise.all([
    Book.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Book.countDocuments(query)
  ]);

  return res.json({ books, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

export const createBook = asyncHandler(async (req, res) => {
  const { title, author, category, description, price, countInStock, featured } = req.body;

  if (!title || !author || !category || !description || price == null) {
    return res.status(400).json({ message: "Title, author, category, description, and price are required" });
  }

  const data = {
    title,
    author,
    category,
    description,
    price: Number(price),
    countInStock: Number(countInStock) || 0,
    featured: featured === "true" || featured === true
  };

  if (req.file?.cloudinaryUrl) {
    data.image = req.file.cloudinaryUrl;
  }

  const book = await Book.create(data);
  return res.status(201).json(book);
});

export const updateBook = asyncHandler(async (req, res) => {
  const { title, author, category, description, price, countInStock, featured } = req.body;

  const book = await Book.findById(req.params.id);
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (title !== undefined) book.title = title;
  if (author !== undefined) book.author = author;
  if (category !== undefined) book.category = category;
  if (description !== undefined) book.description = description;
  if (price !== undefined) book.price = Number(price);
  if (countInStock !== undefined) book.countInStock = Number(countInStock);
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

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(query).select("-password +role").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(query)
  ]);

  return res.json({ users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

export const getOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query = {};
  const validStatuses = ["Pending", "Shipped", "Delivered", "Cancelled"];
  if (status && validStatuses.includes(status)) {
    query.status = status;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    Order.find(query).populate("user", "name email").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Order.countDocuments(query)
  ]);

  return res.json({ orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["Pending", "Shipped", "Delivered", "Cancelled"];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(", ")}` });
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.status = status;
  await order.save();
  return res.json(order);
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
