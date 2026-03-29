import { Link } from "react-router-dom";
import { apiRequest } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const WishlistPage = () => {
  const { profile, loadProfile } = useAuth();
  const wishlist = profile?.wishlist || [];

  const toggleWishlist = async (bookId) => {
    try {
      await apiRequest(`/users/wishlist/${bookId}`, { method: "PUT" });
      await loadProfile();
    } catch { /* silent */ }
  };

  return (
    <div className="container section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Account</p>
          <h1>My Wishlist</h1>
        </div>
      </div>
      {wishlist.length === 0 ? (
        <p className="loading-state">Your wishlist is empty. <Link to="/books" style={{ color: "var(--accent)", fontWeight: 600 }}>Browse books</Link></p>
      ) : (
        <div className="book-grid">
          {wishlist.map((book) => (
            <article className="book-card" key={book._id}>
              <img src={book.image} alt={book.title} />
              <div className="book-body">
                <Link to={`/books/${book._id}`} className="book-title">{book.title}</Link>
                <p className="book-author">{book.author}</p>
                <div className="book-footer">
                  <strong>Tk {book.price}</strong>
                  <button onClick={() => toggleWishlist(book._id)}>Remove</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
