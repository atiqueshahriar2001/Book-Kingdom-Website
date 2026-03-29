import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiRequest } from "../api/client.js";
import BookCard from "../components/ui/BookCard.jsx";
import Dropdown from "../components/ui/Dropdown.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const initialFilters = {
  search: "",
  category: "All",
  minPrice: 0,
  maxPrice: 5000,
  rating: ""
};

const BooksPage = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || "All";
  const [filters, setFilters] = useState({ ...initialFilters, category: categoryParam });
  const [data, setData] = useState({ books: [], pages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { profile, loadProfile, user } = useAuth();

  const fetchBooks = async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ ...filters, page });
      const result = await apiRequest(`/books?${params.toString()}`);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const newFilters = { ...initialFilters, category: categoryParam };
    setFilters(newFilters);
    const params = new URLSearchParams({ ...newFilters, page: 1 });
    setLoading(true);
    setError("");
    apiRequest(`/books?${params.toString()}`)
      .then((result) => setData(result))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [categoryParam]);

  const submitFilters = (event) => {
    event.preventDefault();
    fetchBooks();
  };

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
    <div className="container section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1>All Books</h1>
        </div>
      </div>
      <form className="filter-bar" onSubmit={submitFilters}>
        <input
          placeholder="Search title or author"
          value={filters.search}
          onChange={(event) => setFilters({ ...filters, search: event.target.value })}
        />
        <Dropdown
          value={filters.category}
          onChange={(event) => setFilters({ ...filters, category: event.target.value })}
        >
          <option>All</option>
          <option>Fiction</option>
          <option>Science</option>
          <option>ইসলামিক</option>
        </Dropdown>
        <input
          type="number"
          placeholder="Min price"
          value={filters.minPrice}
          onChange={(event) => setFilters({ ...filters, minPrice: Number(event.target.value) })}
        />
        <input
          type="number"
          placeholder="Max price"
          value={filters.maxPrice}
          onChange={(event) => setFilters({ ...filters, maxPrice: Number(event.target.value) })}
        />
        <Dropdown
          value={filters.rating}
          onChange={(event) => setFilters({ ...filters, rating: event.target.value })}
        >
          <option value="">Any rating</option>
          <option value="4">4+ stars</option>
          <option value="3">3+ stars</option>
        </Dropdown>
        <button type="submit">Apply Filters</button>
      </form>
      {error && <p className="error-text">{error}</p>}
      {loading ? (
        <p className="loading-state">Loading books...</p>
      ) : (
        <>
          {data.books.length === 0 ? (
            <p className="loading-state">No books found matching your criteria.</p>
          ) : (
            <div className="book-grid">
              {data.books.map((book) => (
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
          {data.pages > 1 && (
            <div className="pagination">
              {Array.from({ length: data.pages }, (_, index) => (
                <button key={index + 1} onClick={() => fetchBooks(index + 1)}>
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BooksPage;
