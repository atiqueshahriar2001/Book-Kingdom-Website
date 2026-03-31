import mongoose from "mongoose";
import User from "../models/User.js";
import Book from "../models/Book.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("-password +role")
    .populate("wishlist")
    .populate("cart.book");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const populatedWishlist = Array.isArray(user.wishlist) ? user.wishlist : [];
  const populatedCart = Array.isArray(user.cart) ? user.cart : [];
  const validWishlist = populatedWishlist.filter(Boolean);
  const validCart = populatedCart.filter((item) => item.book);
  const needsWishlistCleanup = validWishlist.length !== populatedWishlist.length;
  const needsCartCleanup = validCart.length !== user.cart.length;

  if (needsWishlistCleanup || needsCartCleanup) {
    user.wishlist = validWishlist.map((book) => book._id || book);
    user.cart = validCart.map((item) => ({
      book: item.book._id || item.book,
      quantity: item.quantity
    }));
    await user.save();
  }

  const profile = user.toObject();
  profile.wishlist = validWishlist.map((book) => book.toObject ? book.toObject() : book);
  profile.cart = validCart.map((item) => ({
    ...item.toObject(),
    book: item.book?.toObject ? item.book.toObject() : item.book
  }));

  return res.json(profile);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (req.body.name !== undefined) user.name = typeof req.body.name === "string" ? req.body.name.trim() : user.name;
  if (req.body.phone !== undefined) user.phone = typeof req.body.phone === "string" ? req.body.phone.trim() : user.phone;
  if (req.body.address !== undefined) user.address = typeof req.body.address === "string" ? req.body.address.trim() : user.address;

  if (req.file?.cloudinaryUrl) {
    user.profilePhoto = req.file.cloudinaryUrl;
  }

  await user.save();
  const updated = await User.findById(req.user._id).select("-password +role");
  return res.json({ message: "Profile updated", user: updated });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const normalizedCurrentPassword = typeof currentPassword === "string" ? currentPassword : "";
  const normalizedNewPassword = typeof newPassword === "string" ? newPassword : "";

  if (!normalizedCurrentPassword || !normalizedNewPassword) {
    return res.status(400).json({ message: "Current password and new password are required" });
  }

  if (normalizedNewPassword.length < 6) {
    return res.status(400).json({ message: "New password must be at least 6 characters" });
  }

  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (!(await user.matchPassword(normalizedCurrentPassword))) {
    return res.status(400).json({ message: "Current password is incorrect" });
  }

  user.password = normalizedNewPassword;
  await user.save();
  return res.json({ message: "Password updated" });
});

export const toggleWishlist = asyncHandler(async (req, res) => {
  const { bookId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return res.status(400).json({ message: "Invalid book ID" });
  }

  const book = await Book.findById(bookId);
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const exists = user.wishlist.some((id) => id.toString() === bookId);

  user.wishlist = exists
    ? user.wishlist.filter((id) => id.toString() !== bookId)
    : [...user.wishlist, bookId];

  await user.save();
  const updated = await User.findById(req.user._id).populate("wishlist");
  return res.json((updated.wishlist || []).filter(Boolean));
});

export const updateCart = asyncHandler(async (req, res) => {
  const { bookId, quantity, mode } = req.body;

  if (!bookId || !mongoose.Types.ObjectId.isValid(bookId)) {
    return res.status(400).json({ message: "Valid book ID is required" });
  }

  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 0) {
    return res.status(400).json({ message: "Quantity must be a non-negative whole number" });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const existingItem = user.cart.find((item) => item.book.toString() === bookId);

  if (qty === 0) {
    user.cart = user.cart.filter((item) => item.book.toString() !== bookId);
    await user.save();
    const updated = await User.findById(req.user._id).populate("cart.book");
    return res.json(updated.cart);
  }

  const book = await Book.findById(bookId);
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  const isIncrementMode = mode === "increment";
  const nextQuantity = existingItem
    ? (isIncrementMode ? existingItem.quantity + qty : qty)
    : qty;

  if (nextQuantity > book.countInStock) {
    return res.status(400).json({
      message: `"${book.title}" has only ${book.countInStock} items in stock`
    });
  }

  if (existingItem) {
    existingItem.quantity = nextQuantity;
  } else if (qty > 0) {
    user.cart.push({ book: bookId, quantity: qty });
  }

  user.cart = user.cart.filter((item) => item.quantity > 0);
  await user.save();
  const updated = await User.findById(req.user._id).populate("cart.book");
  return res.json(updated.cart);
});

export const clearCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  user.cart = [];
  await user.save();
  return res.json({ message: "Cart cleared" });
});
