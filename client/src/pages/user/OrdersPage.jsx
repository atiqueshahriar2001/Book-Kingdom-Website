import { useEffect, useState } from "react";
import { apiRequest } from "../../api/client.js";

const statusClass = (status) => {
  const s = status?.toLowerCase();
  if (s === "delivered") return "status-badge status-delivered";
  if (s === "shipped") return "status-badge status-shipped";
  return "status-badge status-pending";
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/orders/mine")
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container section">
        <p className="loading-state">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="container section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Account</p>
          <h1>Order History</h1>
        </div>
      </div>
      {error && <p className="error-text">{error}</p>}
      {orders.length === 0 ? (
        <p className="loading-state">No orders yet. Start shopping to see your orders here.</p>
      ) : (
        <div className="stack">
          {orders.map((order) => (
            <article className="list-card" key={order._id}>
              <div>
                <strong>Order #{order._id.slice(-6).toUpperCase()}</strong>
                <p>{new Date(order.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}</p>
              </div>
              <div className="inline-actions">
                <span className={statusClass(order.status)}>{order.status}</span>
                <strong>Tk {order.totalPrice.toLocaleString()}</strong>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
