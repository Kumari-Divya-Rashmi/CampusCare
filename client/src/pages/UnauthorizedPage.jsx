import { Link } from "react-router-dom";

const UnauthorizedPage = () => {
  return (
    <div className="center-page">
      <div>
        <h1>403</h1>

        <h2>Access Denied</h2>

        <p>
          You do not have permission
          to view this page.
        </p>

        <Link to="/login">
          Return to Login
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;