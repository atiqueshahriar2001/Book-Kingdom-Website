import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../api/client.js";

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiRequest("/admin/stats").then(setStats).catch((err) => setError(err.message));
    apiRequest("/admin/orders?limit=5").then((data) => setRecentOrders(data.orders || [])).catch(() => {});
    apiRequest("/admin/users?limit=5").then((data) => setRecentUsers(data.users || [])).catch(() => {});
  }, []);

  if (error) return <div className="admin-page"><p className="loading-state">Error: {error}</p></div>;
  if (!stats) return <div className="admin-page"><p className="loading-state">Loading dashboard...</p></div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Dashboard</h1>
        </div>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card admin-stat-users">
          <div className="admin-stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <strong>{stats.users}</strong>
            <span>Registered Users</span>
          </div>
        </div>

        <div className="admin-stat-card admin-stat-books">
          <div className="admin-stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div>
            <strong>{stats.books}</strong>
            <span>Total Books</span>
          </div>
        </div>

        <div className="admin-stat-card admin-stat-orders">
          <div className="admin-stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <div>
            <strong>{stats.orders}</strong>
            <span>Total Orders</span>
          </div>
        </div>

        <div className="admin-stat-card admin-stat-revenue">
          <div className="admin-stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div>
            <strong>Tk {stats.revenue?.toLocaleString()}</strong>
            <span>Total Revenue</span>
          </div>
        </div>
      </div>

      <div className="admin-dashboard-grid">
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Recent Orders</h2>
            <Link to="/admin/orders">View All</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="loading-state">No orders yet.</p>
          ) : (
            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td><span className="admin-id">#{order._id.slice(-6).toUpperCase()}</span></td>
                      <td>{order.user?.name || "N/A"}</td>
                      <td>
                        <span className={`status-badge status-${order.status?.toLowerCase() === "delivered" ? "delivered" : order.status?.toLowerCase() === "shipped" ? "shipped" : "pending"}`}>
                          {order.status}
                        </span>
                      </td>
                      <td><strong>Tk {order.totalPrice}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Recent Users</h2>
            <Link to="/admin/users">View All</Link>
          </div>
          {recentUsers.length === 0 ? (
            <p className="loading-state">No users yet.</p>
          ) : (
            <div className="admin-user-list">
              {recentUsers.map((u) => (
                <div key={u._id} className="admin-user-row">
                  <div className="admin-user-row-avatar">
                    {u.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div className="admin-user-row-info">
                    <strong>{u.name}</strong>
                    <span>{u.email}</span>
                  </div>
                  <span className={`admin-role-badge ${u.role === "admin" ? "admin-role-admin" : "admin-role-user"}`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="admin-quick-actions">
        <p className="admin-nav-label">Quick Actions</p>
        <div className="admin-quick-actions-grid">
          <Link to="/admin/books" className="admin-action-card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add New Book</span>
          </Link>
          <Link to="/admin/orders" className="admin-action-card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span>Manage Orders</span>
          </Link>
          <Link to="/admin/users" className="admin-action-card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            <span>Manage Users</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
