import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { loadProfile } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Bangladesh"
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submitOrder = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setError("");
    setSubmitting(true);
    try {
      await apiRequest("/orders", {
        method: "POST",
        body: JSON.stringify({ shippingAddress: form, paymentMethod: "Cash on Delivery" })
      });
      try {
        await loadProfile();
      } catch {
        // The order is already placed; don't block navigation on a profile refresh failure.
      }
      navigate("/orders");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fieldLabels = {
    fullName: "Full Name",
    phone: "Phone Number",
    address: "Street Address",
    city: "City",
    postalCode: "Postal Code",
    country: "Country"
  };

  const fieldAutocomplete = {
    fullName: "name",
    phone: "tel",
    address: "street-address",
    city: "address-level2",
    postalCode: "postal-code",
    country: "country"
  };

  return (
    <div className="container section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Checkout</p>
          <h1>Shipping Information</h1>
        </div>
      </div>
      {error && <p className="error-text" style={{ marginBottom: "1rem" }}>{error}</p>}
      <form className="form-card" onSubmit={submitOrder} style={{ maxWidth: "600px" }}>
        {Object.keys(form).map((key) => (
          <div key={key}>
            <label htmlFor={`checkout-${key}`}>{fieldLabels[key] || key}</label>
            <input
              id={`checkout-${key}`}
              name={key}
              type={key === "phone" ? "tel" : "text"}
              autoComplete={fieldAutocomplete[key] ?? "off"}
              placeholder={fieldLabels[key] || key}
              value={form[key]}
              onChange={(event) => setForm({ ...form, [key]: event.target.value })}
              required={key !== "postalCode" && key !== "country"}
            />
          </div>
        ))}
        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? "Placing Order..." : "Place Order"}
        </button>
      </form>
    </div>
  );
};

export default CheckoutPage;
