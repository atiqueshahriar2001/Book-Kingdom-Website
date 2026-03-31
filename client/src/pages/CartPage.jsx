import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const CartPage = () => {
  const { profile, loadProfile } = useAuth();
  const cart = profile?.cart || [];
  const [error, setError] = useState("");
  const [draftQuantities, setDraftQuantities] = useState({});
  const total = cart.reduce((sum, item) => sum + (item.book?.price || 0) * item.quantity, 0);

  useEffect(() => {
    const nextDrafts = {};
    cart.filter((item) => item.book).forEach((item) => {
      nextDrafts[item.book._id] = String(item.quantity);
    });
    setDraftQuantities(nextDrafts);
  }, [profile?.cart]);

  const updateQuantity = async (bookId, quantity) => {
    setError("");
    try {
      await apiRequest("/users/cart", {
        method: "PUT",
        body: JSON.stringify({ bookId, quantity: Number(quantity) })
      });
      await loadProfile();
    } catch (err) {
      setError(err.message);
      setDraftQuantities((current) => ({
        ...current,
        [bookId]: String(cart.find((item) => item.book?._id === bookId)?.quantity ?? 1)
      }));
    }
  };

  const handleQuantityChange = (bookId, value) => {
    if (value === "" || /^[0-9]+$/.test(value)) {
      setDraftQuantities((current) => ({ ...current, [bookId]: value }));
    }
  };

  const handleQuantityCommit = async (bookId) => {
    const rawValue = draftQuantities[bookId] ?? "";
    if (rawValue === "") {
      setDraftQuantities((current) => ({
        ...current,
        [bookId]: String(cart.find((item) => item.book?._id === bookId)?.quantity ?? 1)
      }));
      return;
    }

    const nextQuantity = Number(rawValue);
    if (!Number.isInteger(nextQuantity) || nextQuantity < 1) {
      setDraftQuantities((current) => ({
        ...current,
        [bookId]: String(cart.find((item) => item.book?._id === bookId)?.quantity ?? 1)
      }));
      return;
    }

    await updateQuantity(bookId, nextQuantity);
  };

  return (
    <div className="container section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Shopping</p>
          <h1>Your Cart</h1>
        </div>
      </div>
      {error && <p className="error-text">{error}</p>}
      {cart.length === 0 ? (
        <p className="loading-state">Your cart is empty. <Link to="/books" style={{ color: "var(--accent)", fontWeight: 600 }}>Browse books</Link></p>
      ) : (
        <>
          <div className="stack">
            {cart.filter((item) => item.book).map((item) => (
              <article className="list-card" key={item.book._id}>
                <div>
                  <strong>{item.book.title}</strong>
                  <p>Tk {item.book.price} each</p>
                </div>
                <div className="inline-actions">
                  <input
                    id={`cart-quantity-${item.book._id}`}
                    name={`quantity-${item.book._id}`}
                    type="number"
                    min="1"
                    value={draftQuantities[item.book._id] ?? String(item.quantity)}
                    onChange={(event) => handleQuantityChange(item.book._id, event.target.value)}
                    onBlur={() => handleQuantityCommit(item.book._id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleQuantityCommit(item.book._id);
                      }
                    }}
                    style={{ width: "80px" }}
                    autoComplete="off"
                  />
                  <button onClick={() => updateQuantity(item.book._id, 0)}>Remove</button>
                </div>
              </article>
            ))}
          </div>
          <div className="summary-card">
            <strong>Total: Tk {total.toLocaleString()}</strong>
            <Link className="primary-button" to="/checkout">Proceed to Checkout</Link>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
