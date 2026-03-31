import { useEffect, useState } from "react";
import { apiRequest } from "../../api/client.js";
import Dropdown from "../../components/ui/Dropdown.jsx";

const STATUS_OPTIONS = {
  Pending: ["Pending", "Shipped", "Cancelled"],
  Shipped: ["Shipped", "Delivered", "Cancelled"],
  Delivered: ["Delivered"],
  Cancelled: ["Cancelled"]
};

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [error, setError] = useState("");

  const loadOrders = (nextPage = page) => {
    setLoading(true);
    return apiRequest(`/admin/orders?page=${nextPage}`)
      .then((data) => {
        setOrders(data.orders || []);
        setPage(data.page || nextPage);
        setPages(data.pages || 1);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders(page);
  }, [page]);

  const updateStatus = async (id, status) => {
    try {
      await apiRequest(`/admin/orders/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status })
      });
      await loadOrders();
    } catch (err) {
      setError(err.message);
    }
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
      {loading ? (
        <p className="loading-state">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="loading-state">No orders to display.</p>
      ) : (
        <>
          <div className="stack">
            {orders.map((order) => (
              <article className="list-card" key={order._id}>
                <div>
                  <strong>{order.user?.name}</strong>
                  <p>{order.user?.email}</p>
                </div>
                <div className="inline-actions">
                  <Dropdown value={order.status} onChange={(e) => updateStatus(order._id, e.target.value)}>
                    {(STATUS_OPTIONS[order.status] || [order.status]).map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </Dropdown>
                  <strong>Tk {order.totalPrice}</strong>
                </div>
              </article>
            ))}
          </div>
          {pages > 1 && (
            <div className="pagination">
              {Array.from({ length: pages }, (_, index) => (
                <button key={index + 1} onClick={() => setPage(index + 1)} disabled={page === index + 1}>
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

export default AdminOrdersPage;
