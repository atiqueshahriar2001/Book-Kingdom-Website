import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client.js";
import BookCard from "../components/ui/BookCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const { profile, loadProfile, user } = useAuth();

  useEffect(() => {
    apiRequest("/books?featured=true&limit=4")
      .then((data) => setFeatured(data.books))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleWishlist = async (bookId) => {
    if (!user) return;
    try {
      await apiRequest(`/users/wishlist/${bookId}`, { method: "PUT" });
      await loadProfile();
    } catch { /* silent */ }
  };

  const handleCart = async (bookId) => {
    if (!user) return;
    try {
      await apiRequest("/users/cart", {
        method: "PUT",
        body: JSON.stringify({ bookId, quantity: 1 })
      });
      await loadProfile();
    } catch { /* silent */ }
  };

  return (
    <div>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Welcome to Book Kingdom</p>
            <h1>Discover your next great read</h1>
            <p className="hero-copy">
              Explore a curated collection of books across fiction, science, and more.
              Enjoy seamless browsing, secure ordering, and fast delivery &mdash; all in one platform.
            </p>
            <div className="hero-actions">
              <Link className="primary-button" to="/books">Browse Catalog</Link>
              {!user && <Link className="primary-button" to="/login">Login</Link>}
              {!user && <Link className="secondary-button" to="/register">Create Account</Link>}
              {user && <Link className="primary-button" to="/dashboard">My Dashboard</Link>}
            </div>
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Featured</p>
            <h2>Editor&rsquo;s Picks</h2>
          </div>
          <Link className="primary-button" to="/books">View all books &rarr;</Link>
        </div>
        {loading ? (
          <p className="loading-state">Loading featured books...</p>
        ) : (
          <div className="book-grid">
            {featured.map((book) => (
              <BookCard
                key={book._id}
                book={book}
                onWishlist={handleWishlist}
                onCart={handleCart}
                isWishlisted={profile?.wishlist?.some((item) => item._id === book._id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
