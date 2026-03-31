import { body, param, query } from "express-validator";
import { BOOK_CATEGORIES } from "../constants/bookCategories.js";

const objectIdMessage = "Invalid ID";
const orderStatuses = ["Pending", "Shipped", "Delivered", "Cancelled"];
const userRoles = ["user", "admin"];

export const validateRegister = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
];

export const validateLogin = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
];

export const validateObjectIdParam = (field = "id") => [
  param(field)
    .isMongoId()
    .withMessage(objectIdMessage)
];

export const validateProfileUpdate = [
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty"),
  body("phone")
    .optional()
    .isString()
    .withMessage("Phone must be a string")
    .trim(),
  body("address")
    .optional()
    .isString()
    .withMessage("Address must be a string")
    .trim()
];

export const validatePasswordChange = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters")
];

export const validateWishlistToggle = [
  param("bookId")
    .isMongoId()
    .withMessage("Invalid book ID")
];

export const validateCartUpdate = [
  body("bookId")
    .isMongoId()
    .withMessage("Valid book ID is required"),
  body("quantity")
    .isInt({ min: 0 })
    .withMessage("Quantity must be a non-negative whole number"),
  body("mode")
    .optional()
    .isIn(["increment"])
    .withMessage("Mode must be 'increment'")
];

export const validateCreateOrder = [
  body("paymentMethod")
    .optional()
    .isString()
    .withMessage("Payment method must be a string")
    .trim(),
  body("shippingAddress")
    .isObject()
    .withMessage("Shipping address is required"),
  body("shippingAddress.fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required"),
  body("shippingAddress.phone")
    .trim()
    .notEmpty()
    .withMessage("Phone is required"),
  body("shippingAddress.address")
    .trim()
    .notEmpty()
    .withMessage("Address is required"),
  body("shippingAddress.city")
    .trim()
    .notEmpty()
    .withMessage("City is required"),
  body("shippingAddress.postalCode")
    .optional({ values: "falsy" })
    .isString()
    .withMessage("Postal code must be a string")
    .trim(),
  body("shippingAddress.country")
    .optional({ values: "falsy" })
    .isString()
    .withMessage("Country must be a string")
    .trim()
];

export const validateBookReview = [
  param("id")
    .isMongoId()
    .withMessage(objectIdMessage),
  body("rating")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("comment")
    .trim()
    .notEmpty()
    .withMessage("Comment is required")
];

export const validateBookId = [
  param("id")
    .isMongoId()
    .withMessage(objectIdMessage)
];

export const validateBookQuery = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Limit must be a positive integer"),
  query("category")
    .optional({ values: "falsy" })
    .isIn(["All", ...BOOK_CATEGORIES])
    .withMessage(`Category must be one of: All, ${BOOK_CATEGORIES.join(", ")}`),
  query("rating")
    .optional({ values: "falsy" })
    .isFloat({ min: 0, max: 5 })
    .withMessage("Rating filter must be a number between 0 and 5"),
  query("minPrice")
    .optional({ values: "falsy" })
    .isFloat({ min: 0 })
    .withMessage("Minimum price must be a valid non-negative number"),
  query("maxPrice")
    .optional({ values: "falsy" })
    .isFloat({ min: 0 })
    .withMessage("Maximum price must be a valid non-negative number")
];

export const validateAdminBookCreate = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required"),
  body("author")
    .trim()
    .notEmpty()
    .withMessage("Author is required"),
  body("category")
    .trim()
    .isIn(BOOK_CATEGORIES)
    .withMessage(`Category must be one of: ${BOOK_CATEGORIES.join(", ")}`),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a valid non-negative number"),
  body("countInStock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be a valid non-negative whole number"),
  body("featured")
    .optional()
    .isIn(["true", "false", true, false])
    .withMessage("Featured must be true or false")
];

export const validateAdminBookUpdate = [
  ...validateBookId,
  body("title")
    .optional()
    .isString()
    .withMessage("Title must be a string")
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty"),
  body("author")
    .optional()
    .isString()
    .withMessage("Author must be a string")
    .trim()
    .notEmpty()
    .withMessage("Author cannot be empty"),
  body("category")
    .optional()
    .trim()
    .isIn(BOOK_CATEGORIES)
    .withMessage(`Category must be one of: ${BOOK_CATEGORIES.join(", ")}`),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .trim()
    .notEmpty()
    .withMessage("Description cannot be empty"),
  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a valid non-negative number"),
  body("countInStock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be a valid non-negative whole number"),
  body("featured")
    .optional()
    .isIn(["true", "false", true, false])
    .withMessage("Featured must be true or false")
];

export const validateAdminUsersQuery = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Limit must be a positive integer"),
  query("role")
    .optional()
    .isIn(userRoles)
    .withMessage("Role must be either 'user' or 'admin'")
];

export const validateAdminOrdersQuery = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Limit must be a positive integer"),
  query("status")
    .optional()
    .isIn(orderStatuses)
    .withMessage(`Status must be one of: ${orderStatuses.join(", ")}`)
];

export const validateAdminStatsQuery = [
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("startDate must be a valid date"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("endDate must be a valid date")
];

export const validateAdminBooksQuery = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Limit must be a positive integer")
];

export const validateOrderStatusUpdate = [
  ...validateBookId,
  body("status")
    .isIn(orderStatuses)
    .withMessage(`Status must be one of: ${orderStatuses.join(", ")}`)
];

export const validateUserRoleUpdate = [
  ...validateBookId,
  body("role")
    .isIn(userRoles)
    .withMessage("Role must be either 'user' or 'admin'")
];
