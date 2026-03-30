import { Link } from "react-router-dom";

const BookCard = ({ book, onWishlist, onCart, isWishlisted }) => (
  <article className="book-card">
    <Link to={`/books/${book._id}`} className="book-cover">
      <img src={book.image} alt={book.title} />
    </Link>
    <div className="book-body">
      <div className="book-meta">
        <span>{book.category}</span>
        <span>★ {book.rating?.toFixed?.(1) || "0.0"}</span>
      </div>
      <Link to={`/books/${book._id}`} className="book-title">{book.title}</Link>
      <p className="book-author">by {book.author}</p>
      <div className="book-footer">
        <strong>Tk {book.price}</strong>
        <div className="card-actions">
          <button onClick={() => onWishlist?.(book._id)}>
            {isWishlisted ? "♥ Saved" : "Wishlist"}
          </button>
          <button className="primary-button" onClick={() => onCart?.(book._id)}>Add to Cart</button>
        </div>
      </div>
    </div>
  </article>
);

export default BookCard;
