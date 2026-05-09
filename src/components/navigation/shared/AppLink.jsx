import { Link, useMatch, useResolvedPath } from "react-router-dom";

function AppLink({ to, className = "", children, testId, ...props }) {
  const resolvedPath = useResolvedPath(to);
  const isActive = useMatch({ path: resolvedPath.pathname, end: true });
  const attrs = { ...props };

  if (testId && typeof attrs["data-testid"] === "undefined") {
    attrs["data-testid"] = testId;
  }

  return (
    <Link
      to={to}
      className={`${className} ${isActive ? "active" : ""}`}
      {...attrs}
    >
      {children}
    </Link>
  );
}

export default AppLink;
