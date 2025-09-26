import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Decryption from "../components/Decryption.jsx";

describe("Decryption token visibility toggle", () => {
  it("toggles between password and text", () => {
    render(<Decryption />);
    const input = screen.getByTestId("decryption.token.input");
    const toggle = screen.getByTestId("decryption.token.toggle");

    // default should be masked (password)
    expect(input).toHaveAttribute("type", "password");

    // click visible
    fireEvent.click(toggle);
    expect(input).toHaveAttribute("type", "text");

    // click again masked
    fireEvent.click(toggle);
    expect(input).toHaveAttribute("type", "password");
  });
});
