import { useEffect, useState } from "react";
import { apiRequest } from "../../api/client.js";
import Dropdown from "../../components/ui/Dropdown.jsx";

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);

  const [error, setError] = useState("");

  const loadOrders = () =>
    apiRequest("/admin/orders")
      .then((data) => {
        setOrders(data.orders);
        setError("");
      })
      .catch((err) => setError(err.message));

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (id, status) => {
    await apiRequest(`/admin/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status })
    });
    await loadOrders();
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow">Management</p>
          <h1>Manage Orders</h1>
        </div>
      </div>
      {error && <p className="error-text">{error}</p>}
      {orders.length === 0 ? (
        <p className="loading-state">No orders to display.</p>
      ) : (
        <div className="stack">
          {orders.map((order) => (
            <article className="list-card" key={order._id}>
              <div>
                <strong>{order.user?.name}</strong>
                <p>{order.user?.email}</p>
              </div>
              <div className="inline-actions">
                <Dropdown value={order.status} onChange={(e) => updateStatus(order._id, e.target.value)}>
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </Dropdown>
                <strong>Tk {order.totalPrice}</strong>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
