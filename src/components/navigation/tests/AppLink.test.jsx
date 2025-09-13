import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import AppLink from "../shared/AppLink";

describe("AppLink", () => {
  it("renders a link with given testId", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppLink to="/Encryption" testId="test-encryption">
          Encryption
        </AppLink>
      </MemoryRouter>
    );

    const link = screen.getByTestId("test-encryption");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/Encryption");
    expect(link).toHaveTextContent("Encryption");
  });

  it("applies active style when route matches", () => {
    render(
      <MemoryRouter initialEntries={["/Encryption"]}>
        <AppLink to="/Encryption" testId="test-encryption">
          Encryption
        </AppLink>
      </MemoryRouter>
    );

    const link = screen.getByTestId("test-encryption");
    expect(link).toHaveStyle({ backgroundColor: "var(--color-tint)" });
  });
});
