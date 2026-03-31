import { useEffect, useRef, useState } from "react";
import { apiRequest } from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";

const ProfilePage = () => {
  const { profile, loadProfile } = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: ""
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: ""
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || "",
        phone: profile.phone || "",
        address: profile.address || ""
      });
      setPhotoPreview(profile.profilePhoto || "");
    }
  }, [profile]);

  useEffect(() => {
    return () => {
      if (photoPreview && photoFile) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview, photoFile]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (photoPreview && photoFile) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("phone", form.phone);
      fd.append("address", form.address);
      if (photoFile) {
        fd.append("profilePhoto", photoFile);
      }
      await apiRequest("/users/profile", {
        method: "PUT",
        body: fd
      });
      if (photoPreview && photoFile) {
        URL.revokeObjectURL(photoPreview);
      }
      setPhotoFile(null);
      try {
        await loadProfile();
      } catch {
        // Profile save already succeeded; avoid showing a false failure if refresh is flaky.
      }
      setMessage("Profile updated successfully");
    } catch (err) {
      setError(err.message);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      await apiRequest("/users/password", {
        method: "PUT",
        body: JSON.stringify(passwords)
      });
      setPasswords({ currentPassword: "", newPassword: "" });
      setMessage("Password changed successfully");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Account</p>
          <h1>Profile Settings</h1>
        </div>
      </div>
      {message && <p style={{ color: "var(--success)", fontWeight: 500, marginBottom: "1rem" }}>{message}</p>}
      {error && <p className="error-text" style={{ marginBottom: "1rem" }}>{error}</p>}
      <div className="split-layout">
        <form className="form-card" onSubmit={saveProfile}>
          <h2>Personal Information</h2>
          <label htmlFor="profile-photo">Profile Photo</label>
          <div className="photo-upload-area" onClick={() => fileRef.current?.click()}>
            {photoPreview ? (
              <img src={photoPreview} alt="Profile" className="photo-preview" />
            ) : (
              <div className="photo-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 32, height: 32, color: "var(--muted)" }}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>Click to upload photo</span>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            id="profile-photo"
            name="profilePhoto"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            style={{ display: "none" }}
            onChange={handlePhotoChange}
          />
          <label htmlFor="profile-name">Full name</label>
          <input
            id="profile-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
          <label htmlFor="profile-phone">Phone number</label>
          <input
            id="profile-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="Your phone"
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
          />
          <label htmlFor="profile-address">Address</label>
          <textarea
            id="profile-address"
            name="address"
            autoComplete="street-address"
            rows="4"
            placeholder="Your address"
            value={form.address}
            onChange={(event) => setForm({ ...form, address: event.target.value })}
          />
          <button className="primary-button" type="submit">Save Changes</button>
        </form>
        <form className="form-card" onSubmit={changePassword}>
          <h2>Change Password</h2>
          <input
            type="text"
            name="username"
            autoComplete="username"
            value={profile?.email || ""}
            readOnly
            tabIndex={-1}
            aria-hidden="true"
            style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 1, height: 1 }}
          />
          <label htmlFor="current-password">Current password</label>
          <input
            id="current-password"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            placeholder="Enter current password"
            value={passwords.currentPassword}
            onChange={(event) =>
              setPasswords({ ...passwords, currentPassword: event.target.value })
            }
          />
          <label htmlFor="new-password">New password</label>
          <input
            id="new-password"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Enter new password"
            value={passwords.newPassword}
            onChange={(event) =>
              setPasswords({ ...passwords, newPassword: event.target.value })
            }
            minLength={6}
          />
          <button className="primary-button" type="submit">Update Password</button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
