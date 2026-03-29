import { useEffect, useState } from "react";
import { apiRequest } from "../../api/client.js";
import Dropdown from "../../components/ui/Dropdown.jsx";

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const loadUsers = () =>
    apiRequest("/admin/users")
      .then((data) => setUsers(data.users))
      .catch((err) => setError(err.message));

  useEffect(() => {
    loadUsers();
  }, []);

  const updateRole = async (id, role) => {
    setError("");
    try {
      await apiRequest(`/admin/users/${id}`, {
        method: "PUT",
        body: JSON.stringify({ role })
      });
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const removeUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete user "${name}"?`)) return;
    setError("");
    try {
      await apiRequest(`/admin/users/${id}`, { method: "DELETE" });
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow">Management</p>
          <h1>Manage Users</h1>
        </div>
      </div>
      {error && <p className="error-text">{error}</p>}
      {users.length === 0 ? (
        <p className="loading-state">No users to display.</p>
      ) : (
        <div className="stack">
          {users.map((user) => (
            <article className="list-card" key={user._id}>
              <div>
                <strong>{user.name}</strong>
                <p>{user.email}</p>
              </div>
              <div className="inline-actions">
                <Dropdown value={user.role} onChange={(e) => updateRole(user._id, e.target.value)}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </Dropdown>
                <button onClick={() => removeUser(user._id, user.name)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
