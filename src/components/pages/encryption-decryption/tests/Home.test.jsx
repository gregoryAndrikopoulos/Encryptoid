import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import Home from "../../home/Home.jsx";

describe("Home basics", () => {
  it("renders the home page container", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(screen.getByTestId("page.home")).toBeInTheDocument();
  });

  it("renders both encryption and decryption cards", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    const encCard = screen.getByTestId("home.card.encryption");
    const decCard = screen.getByTestId("home.card.decryption");

    expect(encCard).toBeInTheDocument();
    expect(decCard).toBeInTheDocument();
  });

  it("has correct link destinations", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(screen.getByTestId("home.card.encryption")).toHaveAttribute(
      "href",
      "/encryption"
    );
    expect(screen.getByTestId("home.card.decryption")).toHaveAttribute(
      "href",
      "/decryption"
    );
  });

  it("renders informational sections", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByTestId("home.howto")).toBeInTheDocument();
    expect(screen.getByTestId("home.notes")).toBeInTheDocument();
  });
});
