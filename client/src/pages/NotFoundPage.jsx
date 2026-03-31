import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="container section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">404</p>
          <h1>Page not found</h1>
        </div>
      </div>
      <p className="loading-state" style={{ textAlign: "left" }}>
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link className="primary-button" to="/">Go back home</Link>
    </div>
  );
};

export default NotFoundPage;
