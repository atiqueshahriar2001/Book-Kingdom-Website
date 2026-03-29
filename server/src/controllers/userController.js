import mongoose from "mongoose";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("-password +role")
    .populate("wishlist")
    .populate("cart.book");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json(user);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (req.body.name !== undefined) user.name = req.body.name;
  if (req.body.phone !== undefined) user.phone = req.body.phone;
  if (req.body.address !== undefined) user.address = req.body.address;

  if (req.file?.cloudinaryUrl) {
    user.profilePhoto = req.file.cloudinaryUrl;
  }

  await user.save();
  return res.json({ message: "Profile updated", profilePhoto: user.profilePhoto });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current password and new password are required" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: "New password must be at least 6 characters" });
  }

  const user = await User.findById(req.user._id);

  if (!(await user.matchPassword(currentPassword))) {
    return res.status(400).json({ message: "Current password is incorrect" });
  }

  user.password = newPassword;
  await user.save();
  return res.json({ message: "Password updated" });
});

export const toggleWishlist = asyncHandler(async (req, res) => {
  const { bookId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return res.status(400).json({ message: "Invalid book ID" });
  }

  const user = await User.findById(req.user._id);
  const exists = user.wishlist.some((id) => id.toString() === bookId);

  user.wishlist = exists
    ? user.wishlist.filter((id) => id.toString() !== bookId)
    : [...user.wishlist, bookId];

  await user.save();
  const updated = await User.findById(req.user._id).populate("wishlist");
  return res.json(updated.wishlist);
});

export const updateCart = asyncHandler(async (req, res) => {
  const { bookId, quantity } = req.body;

  if (!bookId || !mongoose.Types.ObjectId.isValid(bookId)) {
    return res.status(400).json({ message: "Valid book ID is required" });
  }

  const qty = Number(quantity);
  if (isNaN(qty) || qty < 0) {
    return res.status(400).json({ message: "Quantity must be a non-negative number" });
  }

  const user = await User.findById(req.user._id);
  const existingItem = user.cart.find((item) => item.book.toString() === bookId);

  if (existingItem) {
    existingItem.quantity = qty;
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
  user.cart = [];
  await user.save();
  return res.json({ message: "Cart cleared" });
});
