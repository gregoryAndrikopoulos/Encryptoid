import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Dropzone from "../components/Dropzone.jsx";

describe("Dropzone basics", () => {
  it("renders input that accepts .txt", () => {
    render(<Dropzone onDrop={vi.fn()} />);
    const input = screen.getByTestId("dropzone.input");
    // react-dropzone sets accept to "text/plain,.txt"
    expect(input).toHaveAttribute("accept", expect.stringContaining(".txt"));
  });

  it("renders disabled state when prop is set", () => {
    render(<Dropzone onDrop={vi.fn()} disabled testId="enc.drop" />);
    const root = screen.getByTestId("enc.drop");
    expect(root).toHaveClass("is-disabled");
    expect(root).toHaveAttribute("aria-disabled", "true");
  });
});
