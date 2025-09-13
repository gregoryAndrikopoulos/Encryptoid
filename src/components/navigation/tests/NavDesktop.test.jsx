import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import NavDesktop from "../desktop/NavDesktop";

describe("NavDesktop", () => {
  it("renders title and links", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <NavDesktop />
      </MemoryRouter>
    );

    expect(screen.getByTestId("nav-desktop")).toBeInTheDocument();
    expect(screen.getByTestId("nav-title")).toHaveTextContent("Encryptoid");
    expect(screen.getByTestId("navlink-encryption")).toHaveAttribute(
      "href",
      "/Encryption"
    );
    expect(screen.getByTestId("navlink-decryption")).toHaveAttribute(
      "href",
      "/Decryption"
    );
  });

  it("marks encryption link active on /Encryption", () => {
    render(
      <MemoryRouter initialEntries={["/Encryption"]}>
        <NavDesktop />
      </MemoryRouter>
    );

    expect(screen.getByTestId("navlink-encryption")).toHaveStyle({
      backgroundColor: "var(--color-tint)",
    });
  });
});
