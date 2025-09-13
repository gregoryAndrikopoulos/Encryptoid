import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import NavSwitcher from "../shared/NavSwitcher";

function setWidth(width) {
  vi.spyOn(window, "innerWidth", "get").mockReturnValue(width);
  window.dispatchEvent(new Event("resize"));
}

describe("NavSwitcher", () => {
  it("renders Desktop when width > 1024", () => {
    setWidth(1400);
    render(
      <MemoryRouter initialEntries={["/"]}>
        <NavSwitcher />
      </MemoryRouter>
    );

    expect(screen.getByTestId("nav-desktop")).toBeInTheDocument();
  });

  it("renders Mobile when width <= 1024", () => {
    setWidth(800);
    render(
      <MemoryRouter initialEntries={["/"]}>
        <NavSwitcher />
      </MemoryRouter>
    );

    expect(screen.getByTestId("nav-mobile")).toBeInTheDocument();
  });
});
