import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../ui/Logo.jsx";

const Footer = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <span className="brand">
              <Logo size={36} />
              <div className="brand-text">
                <span>Book Kingdom</span>
                <small>Online Digital Bookstore</small>
              </div>
            </span>
            <p>
              An online digital bookstore platform offering a wide range of books across various genres, providing readers with easy access to their favorite titles and new discoveries.
            </p>
          </div>
          <div className="footer-col">
            <h4>Shop</h4>
            <Link to="/books">All Books</Link>
            <Link to="/books?category=Fiction">Fiction</Link>
            <Link to="/books?category=Science">Science</Link>
            <Link to="/books?category=ইসলামিক">Islamic</Link>
          </div>
          <div className="footer-col">
            <h4>Account</h4>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <Link to="/orders">My Orders</Link>
            <Link to="/wishlist">Wishlist</Link>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <Link to="/">About Us</Link>
            <Link to="/">Contact</Link>
            <Link to="/">Privacy Policy</Link>
            <Link to="/">Terms of Service</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} Book Kingdom. All rights reserved.</span>
          <div className="footer-bottom-links">
            <Link to="/">Privacy</Link>
            <Link to="/">Terms</Link>
            <Link to="/">Support</Link>
          </div>
        </div>
      </div>
      {showScrollTop && (
        <button className="scroll-top-btn" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          ↑ Top
        </button>
      )}
    </footer>
  );
};

export default Footer;
