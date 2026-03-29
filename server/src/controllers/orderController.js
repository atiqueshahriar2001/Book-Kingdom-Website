import Book from "../models/Book.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod = "Cash on Delivery" } = req.body;
  const user = await User.findById(req.user._id).populate("cart.book");

  if (!shippingAddress?.fullName || !shippingAddress?.phone || !shippingAddress?.address || !shippingAddress?.city) {
    return res.status(400).json({ message: "Complete shipping information is required" });
  }

  if (!user.cart.length) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  for (const item of user.cart) {
    if (!item.book) {
      return res.status(400).json({ message: "One or more items in your cart no longer exist" });
    }
    if (item.book.countInStock < item.quantity) {
      return res.status(400).json({
        message: `"${item.book.title}" has only ${item.book.countInStock} items in stock`
      });
    }
  }

  const orderItems = user.cart.map((item) => ({
    title: item.book.title,
    image: item.book.image,
    price: item.book.price,
    quantity: item.quantity,
    book: item.book._id
  }));

  const itemsPrice = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingPrice = itemsPrice > 1000 ? 0 : 80;
  const totalPrice = itemsPrice + shippingPrice;

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    totalPrice
  });

  await Promise.all(
    user.cart.map(async (item) => {
      const book = await Book.findById(item.book._id);
      if (book) {
        book.countInStock = Math.max(0, book.countInStock - item.quantity);
        await book.save();
      }
    })
  );

  user.cart = [];
  await user.save();
  return res.status(201).json(order);
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  return res.json(orders);
});
