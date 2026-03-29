import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";

const UserDashboardPage = () => {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest("/orders/mine")
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cartCount = profile?.cart?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const wishlistCount = profile?.wishlist?.length || 0;
  const totalSpent = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

  return (
    <div className="container section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Welcome, {user?.name || "User"}</h1>
        </div>
      </div>

      <div className="user-dashboard-stats">
        <div className="stat-card">
          <strong>{orders.length}</strong>
          <span>Total Orders</span>
        </div>
        <div className="stat-card">
          <strong>Tk {totalSpent.toLocaleString()}</strong>
          <span>Total Spent</span>
        </div>
        <div className="stat-card">
          <strong>{wishlistCount}</strong>
          <span>Wishlist Items</span>
        </div>
        <div className="stat-card">
          <strong>{cartCount}</strong>
          <span>Cart Items</span>
        </div>
      </div>

      <div className="user-dashboard-links">
        <Link to="/profile" className="dashboard-link-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <div>
            <strong>Profile</strong>
            <p>Manage your personal information</p>
          </div>
        </Link>
        <Link to="/orders" className="dashboard-link-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <div>
            <strong>Orders</strong>
            <p>View your order history</p>
          </div>
        </Link>
        <Link to="/wishlist" className="dashboard-link-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <div>
            <strong>Wishlist</strong>
            <p>Books you want to read</p>
          </div>
        </Link>
        <Link to="/cart" className="dashboard-link-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <div>
            <strong>Cart</strong>
            <p>Review items in your cart</p>
          </div>
        </Link>
        <Link to="/books" className="dashboard-link-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          <div>
            <strong>Browse Books</strong>
            <p>Explore our collection</p>
          </div>
        </Link>
      </div>

      {orders.length > 0 && (
        <div className="section" style={{ padding: "1.5rem 0 0" }}>
          <div className="section-heading">
            <div>
              <h2>Recent Orders</h2>
            </div>
            <Link to="/orders">View all orders &rarr;</Link>
          </div>
          <div className="stack">
            {orders.slice(0, 3).map((order) => (
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
                  <span className={`status-badge status-${order.status?.toLowerCase() === "delivered" ? "delivered" : order.status?.toLowerCase() === "shipped" ? "shipped" : "pending"}`}>
                    {order.status}
                  </span>
                  <strong>Tk {order.totalPrice}</strong>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboardPage;
