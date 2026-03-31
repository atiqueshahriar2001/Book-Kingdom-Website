export const BOOK_CATEGORIES = ["Fiction", "Science", "ইসলামিক"];

export const isValidBookCategory = (value) =>
  typeof value === "string" && BOOK_CATEGORIES.includes(value.trim());
