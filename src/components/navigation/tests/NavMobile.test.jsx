import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import NavMobile from "../mobile/NavMobile";

describe("NavMobile", () => {
  it("renders mobile nav with links", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <NavMobile />
      </MemoryRouter>
    );

    expect(screen.getByTestId("nav-mobile")).toBeInTheDocument();
    expect(screen.getByTestId("navlink-home")).toHaveAttribute("href", "/");
    expect(screen.getByTestId("navlink-encryption")).toHaveAttribute(
      "href",
      "/Encryption"
    );
    expect(screen.getByTestId("navlink-decryption")).toHaveAttribute(
      "href",
      "/Decryption"
    );
  });
});
