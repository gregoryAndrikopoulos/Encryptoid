import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import { render, screen, within, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import Decryption from "../components/Decryption.jsx";

function makeTxtFile(name = "cipher.encrypted.txt", content = "cipher") {
  return new File([content], name, { type: "text/plain" });
}
function makeEmptyTxt(name = "empty.txt") {
  return new File([""], name, { type: "text/plain" });
}

describe("Decryption (UI-only)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders initial heading + directive + dropzone + token form", () => {
    render(<Decryption />);
    expect(screen.getByTestId("decryption.title")).toBeInTheDocument();
    expect(screen.getByTestId("decryption.directive")).toBeInTheDocument();
    expect(screen.getByTestId("decryption.dropzone.wrap")).toBeInTheDocument();
    expect(screen.getByTestId("decryption.dropzone")).toBeInTheDocument();
    expect(screen.getByTestId("decryption.token.form")).toBeInTheDocument();
  });

  it("rejects empty .txt file for decryption (shows inline error)", async () => {
    render(<Decryption />);
    const dzInput = screen.getByTestId("decryption.dropzone.input");
    await act(async () => {
      fireEvent.change(dzInput, { target: { files: [makeEmptyTxt()] } });
    });
    // Error message visible
    expect(screen.getByTestId("decryption.drop.error")).toHaveTextContent(
      /empty/i
    );
    // Decrypt remains disabled even with a valid token later until a valid file is picked
    const decryptBtn = screen.getByTestId("decryption.action.decrypt");
    expect(decryptBtn).toBeDisabled();
  });

  it("keeps Decrypt disabled until a .txt is selected AND token length is 256", async () => {
    render(<Decryption />);

    const decryptBtn = screen.getByTestId("decryption.action.decrypt");
    const tokenInput = screen.getByTestId("decryption.token.input");
    expect(decryptBtn).toBeDisabled();

    // Type 256-char token without a file → still disabled
    await act(async () => {
      fireEvent.change(tokenInput, { target: { value: "a".repeat(256) } });
    });
    expect(decryptBtn).toBeDisabled();

    // Now drop a txt file → enabled
    const input = screen.getByTestId("decryption.dropzone.input");
    await act(async () => {
      fireEvent.change(input, { target: { files: [makeTxtFile()] } });
    });
    expect(decryptBtn).not.toBeDisabled();
  });

  it("shows token help when token length is non-empty but not 256", async () => {
    render(<Decryption />);
    const tokenInput = screen.getByTestId("decryption.token.input");

    await act(async () => {
      fireEvent.change(tokenInput, { target: { value: "short" } });
    });

    const help = screen.getByTestId("decryption.token.help");
    expect(help).toBeInTheDocument();
    expect(help).toHaveTextContent(/exactly 256 characters/i);
  });

  it("flows: drop .txt + valid token → processing → done; results shown; download disabled in this PR", async () => {
    render(<Decryption />);

    // Drop file
    const dzInput = screen.getByTestId("decryption.dropzone.input");
    await act(async () => {
      fireEvent.change(dzInput, { target: { files: [makeTxtFile()] } });
    });

    // Valid token
    const tokenInput = screen.getByTestId("decryption.token.input");
    await act(async () => {
      fireEvent.change(tokenInput, { target: { value: "x".repeat(256) } });
    });

    const decryptBtn = screen.getByTestId("decryption.action.decrypt");
    expect(decryptBtn).not.toBeDisabled();

    // Click decrypt → processing → done
    await act(async () => {
      fireEvent.click(decryptBtn);
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByTestId("decryption.title.done")).toBeInTheDocument();
    const results = screen.getByTestId("decryption.results");
    const downloadBtn = within(results).getByTestId(
      "decryption.download.decrypted"
    );
    expect(downloadBtn).toBeDisabled();
  });

  it('supports "Decrypt another file" reset', async () => {
    render(<Decryption />);

    const dzInput = screen.getByTestId("decryption.dropzone.input");
    await act(async () => {
      fireEvent.change(dzInput, { target: { files: [makeTxtFile()] } });
    });
    const tokenInput = screen.getByTestId("decryption.token.input");
    await act(async () => {
      fireEvent.change(tokenInput, { target: { value: "x".repeat(256) } });
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("decryption.action.decrypt"));
      vi.advanceTimersByTime(500);
    });

    const results = screen.getByTestId("decryption.results");
    const resetBtn = within(results).getByTestId("decryption.action.reset");
    expect(resetBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(resetBtn);
    });

    // Back to initial state
    expect(screen.getByTestId("decryption.title")).toBeInTheDocument();
    expect(screen.getByTestId("decryption.dropzone.wrap")).toBeInTheDocument();
    expect(screen.getByTestId("decryption.token.form")).toBeInTheDocument();
  });
});
