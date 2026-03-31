import mongoose from "mongoose";
import Book from "../models/Book.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod = "Cash on Delivery" } = req.body;
  const normalizedPaymentMethod =
    typeof paymentMethod === "string" && paymentMethod.trim()
      ? paymentMethod.trim()
      : "Cash on Delivery";
  const normalizedShippingAddress = {
    fullName: shippingAddress?.fullName?.trim() || "",
    phone: shippingAddress?.phone?.trim() || "",
    address: shippingAddress?.address?.trim() || "",
    city: shippingAddress?.city?.trim() || "",
    postalCode: shippingAddress?.postalCode?.trim() || "",
    country: shippingAddress?.country?.trim() || "Bangladesh"
  };

  if (!normalizedShippingAddress.fullName || !normalizedShippingAddress.phone || !normalizedShippingAddress.address || !normalizedShippingAddress.city) {
    return res.status(400).json({ message: "Complete shipping information is required" });
  }

  const session = await mongoose.startSession();

  try {
    let createdOrder;

    await session.withTransaction(async () => {
      const user = await User.findById(req.user._id).session(session);

      if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
      }

      if (!user.cart.length) {
        const error = new Error("Cart is empty");
        error.statusCode = 400;
        throw error;
      }

      const bookIds = user.cart.map((item) => item.book);
      const books = await Book.find({ _id: { $in: bookIds } }).session(session);
      const bookMap = new Map(books.map((book) => [book._id.toString(), book]));

      const orderItems = user.cart.map((item) => {
        const book = bookMap.get(item.book.toString());

        if (!book) {
          const error = new Error("One or more items in your cart no longer exist");
          error.statusCode = 400;
          throw error;
        }

        if (book.countInStock < item.quantity) {
          const error = new Error(`"${book.title}" has only ${book.countInStock} items in stock`);
          error.statusCode = 400;
          throw error;
        }

        if (!book.image) {
          const error = new Error(`"${book.title}" has no image available`);
          error.statusCode = 400;
          throw error;
        }

        return {
          title: book.title,
          image: book.image,
          price: book.price,
          quantity: item.quantity,
          book: book._id
        };
      });

      const itemsPrice = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const shippingPrice = itemsPrice > 1000 ? 0 : 80;
      const totalPrice = itemsPrice + shippingPrice;

      for (const item of orderItems) {
        const updateResult = await Book.updateOne(
          { _id: item.book, countInStock: { $gte: item.quantity } },
          { $inc: { countInStock: -item.quantity } },
          { session }
        );

        if (updateResult.modifiedCount !== 1) {
          const error = new Error(`"${item.title}" is no longer available in the requested quantity`);
          error.statusCode = 409;
          throw error;
        }
      }

      [createdOrder] = await Order.create(
        [
          {
            user: req.user._id,
            orderItems,
            shippingAddress: normalizedShippingAddress,
            paymentMethod: normalizedPaymentMethod,
            itemsPrice,
            shippingPrice,
            totalPrice
          }
        ],
        { session }
      );

      user.cart = [];
      await user.save({ session });
    });

    return res.status(201).json(createdOrder);
  } finally {
    await session.endSession();
  }
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  return res.json(orders);
});
