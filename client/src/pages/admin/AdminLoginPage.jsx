import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login, logout } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const submitHandler = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const data = await login(form);
      if (data.user?.role !== "admin") {
        logout();
        setError("Access denied. Admin credentials required.");
        return;
      }
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-login-shell">
      <form className="admin-login-card" onSubmit={submitHandler}>
        <div className="admin-login-header">
          <img src="https://cdn-icons-png.flaticon.com/512/5402/5402751.png" alt="Admin" className="admin-login-icon" />
          <h1>Admin Login</h1>
          <p>Book Kingdom Control Panel</p>
        </div>
        {error && <p className="admin-login-error">{error}</p>}
        <label htmlFor="admin-email">Email address</label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          required
        />
        <label htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          required
        />
        <button className="admin-login-btn" type="submit">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
          Login as Admin
        </button>
      </form>
    </div>
  );
};

export default AdminLoginPage;
