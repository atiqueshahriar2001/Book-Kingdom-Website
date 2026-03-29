import { useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const CartPage = () => {
  const { profile, loadProfile } = useAuth();
  const cart = profile?.cart || [];
  const [error, setError] = useState("");
  const total = cart.reduce((sum, item) => sum + (item.book?.price || 0) * item.quantity, 0);

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
    }
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
                    value={item.quantity}
                    onChange={(event) => updateQuantity(item.book._id, event.target.value)}
                    style={{ width: "80px" }}
                    autoComplete="off"
                  />
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
