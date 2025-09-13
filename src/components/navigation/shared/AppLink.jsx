import { Link, useMatch, useResolvedPath } from "react-router-dom";

function AppLink({ to, testId, children, ...props }) {
  const resolvedPath = useResolvedPath(to);
  const isActive = useMatch({ path: resolvedPath.pathname, end: true });

  return (
    <li
      className={isActive ? "active" : ""}
      data-testid={testId ? `${testId}-li` : undefined}
    >
      <Link
        to={to}
        data-testid={testId}
        style={
          isActive
            ? {
                color: "var(--color-dark)",
                backgroundColor: "var(--color-tint)",
              }
            : { color: "var(--color-accent)" }
        }
        onMouseLeave={(e) => {
          if (!isActive) e.target.style.color = "var(--color-accent)";
        }}
        {...props}
      >
        {children}
      </Link>
    </li>
  );
}

export default AppLink;
