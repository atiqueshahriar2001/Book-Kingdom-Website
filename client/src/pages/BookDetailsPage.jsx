import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiRequest } from "../api/client.js";
import Dropdown from "../components/ui/Dropdown.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const BookDetailsPage = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [form, setForm] = useState({ rating: 5, comment: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { user, loadProfile } = useAuth();

  const loadBook = async () => {
    try {
      const data = await apiRequest(`/books/${id}`);
      setBook(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadBook();
  }, [id]);

  const handleCart = async () => {
    if (!user) return;
    try {
      await apiRequest("/users/cart", {
        method: "PUT",
        body: JSON.stringify({ bookId: id, quantity: 1 })
      });
      await loadProfile();
      setMessage("Added to cart successfully");
    } catch (err) {
      setError(err.message);
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();
    try {
      await apiRequest(`/books/${id}/reviews`, {
        method: "POST",
        body: JSON.stringify({ ...form, rating: Number(form.rating) })
      });
      setForm({ rating: 5, comment: "" });
      setMessage("Review submitted successfully");
      setError("");
      await loadBook();
    } catch (err) {
      setError(err.message);
    }
  };

  if (error && !book) {
    return (
      <div className="container section">
        <p className="error-text">{error}</p>
      </div>
    );
  }

  if (!book) return <div className="container section"><p className="loading-state">Loading book details...</p></div>;

  return (
    <div className="container section">
      <div className="detail-grid">
        <img className="detail-cover" src={book.image} alt={book.title} />
        <div className="detail-panel">
          <p className="eyebrow">{book.category}</p>
          <h1>{book.title}</h1>
          <p className="book-author">by {book.author}</p>
          <p style={{ color: "var(--ink-secondary)", lineHeight: 1.7 }}>{book.description}</p>
          <div className="detail-stats">
            <strong>Tk {book.price}</strong>
            <span>★ {(book.rating || 0).toFixed(1)} / 5</span>
            <span>{book.numReviews} reviews</span>
          </div>
          <button className="primary-button" onClick={handleCart}>Add to Cart</button>
          {message && <p style={{ color: "var(--success)", fontWeight: 500, marginTop: "0.5rem" }}>{message}</p>}
          {error && <p className="error-text" style={{ marginTop: "0.5rem" }}>{error}</p>}

          {user && (
            <form className="review-form" onSubmit={submitReview}>
              <h3>Write a Review</h3>
              <label>Rating</label>
              <Dropdown
                value={form.rating}
                onChange={(event) => setForm({ ...form, rating: Number(event.target.value) })}
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>{value} star{value > 1 ? "s" : ""}</option>
                ))}
              </Dropdown>
              <label>Your review</label>
              <textarea
                rows="4"
                placeholder="Share your thoughts about this book..."
                value={form.comment}
                onChange={(event) => setForm({ ...form, comment: event.target.value })}
              />
              <button className="primary-button" type="submit">Submit Review</button>
            </form>
          )}

          <div className="review-list">
            {book.reviews?.length > 0 && <h3 style={{ margin: "1.5rem 0 0.5rem" }}>Customer Reviews</h3>}
            {book.reviews?.map((review) => (
              <article key={review._id} className="review-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong>{review.name}</strong>
                  <span>★ {review.rating} / 5</span>
                </div>
                <p>{review.comment}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailsPage;
