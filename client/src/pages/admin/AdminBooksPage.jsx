import { useEffect, useRef, useState } from "react";
import { apiRequest } from "../../api/client.js";
import Dropdown from "../../components/ui/Dropdown.jsx";
import { BOOK_CATEGORIES } from "../../constants/bookCategories.js";

const blankBook = {
  title: "",
  author: "",
  category: "",
  description: "",
  image: "",
  price: 0,
  countInStock: 1,
  featured: false
};

const AdminBooksPage = () => {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(blankBook);
  const [editingId, setEditingId] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const imageRef = useRef(null);

  const loadBooks = () =>
    apiRequest("/admin/books")
      .then((data) => setBooks(data.books || []))
      .catch((err) => setError(err.message));

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview && imageFile) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview, imageFile]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (imagePreview && imageFile) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const submitBook = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setError("");
    if (!editingId && !imageFile) {
      setError("Book cover image is required");
      return;
    }
    setSubmitting(true);
    try {
      const path = editingId ? `/admin/books/${editingId}` : "/admin/books";
      const method = editingId ? "PUT" : "POST";
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("author", form.author);
      fd.append("category", form.category);
      fd.append("description", form.description);
      fd.append("price", form.price);
      fd.append("countInStock", form.countInStock);
      fd.append("featured", form.featured);
      if (imageFile) {
        fd.append("image", imageFile);
      }
      await apiRequest(path, {
        method,
        body: fd
      });
      setForm(blankBook);
      setEditingId("");
      if (imagePreview && imageFile) {
        URL.revokeObjectURL(imagePreview);
      }
      setImageFile(null);
      setImagePreview("");
      if (imageRef.current) imageRef.current.value = "";
      await loadBooks();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteBook = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    setError("");
    try {
      await apiRequest(`/admin/books/${id}`, { method: "DELETE" });
      await loadBooks();
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (book) => {
    setEditingId(book._id);
    setForm({
      title: book.title,
      author: book.author,
      category: book.category,
      description: book.description,
      image: book.image,
      price: book.price,
      countInStock: book.countInStock,
      featured: book.featured
    });
    if (imagePreview && imageFile) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(book.image || "");
    if (imageRef.current) imageRef.current.value = "";
  };

  const cancelEdit = () => {
    setEditingId("");
    setForm(blankBook);
    if (imagePreview && imageFile) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview("");
    if (imageRef.current) imageRef.current.value = "";
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow">Management</p>
          <h1>Manage Books</h1>
        </div>
      </div>
      {error && <p className="error-text">{error}</p>}
      <div className="split-layout">
        <form className="form-card" onSubmit={submitBook}>
          <h2>{editingId ? "Edit Book" : "Add New Book"}</h2>
          <label htmlFor="book-title">Title</label>
          <input id="book-title" name="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required autoComplete="off" />
          <label htmlFor="book-author">Author</label>
          <input id="book-author" name="author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} required autoComplete="off" />
          <label htmlFor="book-category">Category</label>
          <Dropdown
            id="book-category"
            name="category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="">Select a category</option>
            {BOOK_CATEGORIES.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Dropdown>
          <label htmlFor="book-image">Book Cover Image</label>
          <div className="photo-upload-area" onClick={() => imageRef.current?.click()}>
            {imagePreview ? (
              <img src={imagePreview} alt="Book cover" className="photo-preview book-preview" />
            ) : (
              <div className="photo-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 32, height: 32, color: "var(--muted)" }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span>Click to upload book cover</span>
              </div>
            )}
          </div>
          <input
            ref={imageRef}
            id="book-image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
          <label htmlFor="book-price">Price (Tk)</label>
          <input id="book-price" name="price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required min="0" autoComplete="off" />
          <label htmlFor="book-stock">Stock Quantity</label>
          <input id="book-stock" name="countInStock" type="number" value={form.countInStock} onChange={(e) => setForm({ ...form, countInStock: Number(e.target.value) })} min="0" autoComplete="off" />
          <label htmlFor="book-description">Description</label>
          <textarea id="book-description" name="description" rows="5" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required autoComplete="off" />
          <label className="checkbox-line">
            <input id="book-featured" name="featured" type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            Featured book
          </label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="primary-button" type="submit" disabled={submitting}>
              {submitting ? "Saving..." : (editingId ? "Update Book" : "Create Book")}
            </button>
            {editingId && <button type="button" onClick={cancelEdit}>Cancel</button>}
          </div>
        </form>
        <div className="stack">
          {books.map((book) => (
            <article className="list-card" key={book._id}>
              <div>
                <strong>{book.title}</strong>
                <p>{book.author} &middot; Tk {book.price}</p>
              </div>
              <div className="inline-actions">
                <button onClick={() => startEdit(book)}>Edit</button>
                <button onClick={() => deleteBook(book._id)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminBooksPage;
