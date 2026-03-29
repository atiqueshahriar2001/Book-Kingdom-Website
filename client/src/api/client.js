const API_URL = import.meta.env.VITE_API_URL || "https://book-kingdom-server.onrender.com/api";

export const apiRequest = async (path, options = {}) => {
  const token = localStorage.getItem("book-kingdom-token");
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    },
    ...options
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (response.status === 401 && token) {
    localStorage.removeItem("book-kingdom-token");
    localStorage.removeItem("book-kingdom-user");
    window.dispatchEvent(new Event("auth:expired"));
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
};
