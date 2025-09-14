import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import { render, screen, within, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import Encryption from "../components/Encryption.jsx";

function makeTxtFile(name = "sample.txt", content = "hello") {
  return new File([content], name, { type: "text/plain" });
}
function makeEmptyTxt(name = "empty.txt") {
  return new File([""], name, { type: "text/plain" });
}
function makeOtherFile(name = "image.png") {
  return new File(["xx"], name, { type: "image/png" });
}

describe("Encryption (UI-only)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders initial heading + directive + dropzone", () => {
    render(<Encryption />);
    expect(screen.getByTestId("encryption.title")).toHaveTextContent(
      /Commencing file Encryption/i
    );
    expect(screen.getByTestId("encryption.directive")).toBeInTheDocument();
    expect(screen.getByTestId("encryption.dropzone.wrap")).toBeInTheDocument();
    expect(screen.getByTestId("encryption.dropzone")).toBeInTheDocument();
  });

  it("ignores non-.txt files (stays on initial state)", async () => {
    render(<Encryption />);
    const input = screen.getByTestId("encryption.dropzone.input");
    const bad = makeOtherFile();
    await act(async () => {
      fireEvent.change(input, { target: { files: [bad] } });
      vi.advanceTimersByTime(10);
    });
    // Still in initial state
    expect(
      screen.queryByTestId("encryption.title.done")
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("encryption.dropzone.wrap")).toBeInTheDocument();
    // Shows error
    expect(screen.getByTestId("encryption.drop.error")).toHaveTextContent(
      /only \.txt/i
    );
  });

  it("rejects empty .txt file with inline error (stays on initial state)", async () => {
    render(<Encryption />);
    const input = screen.getByTestId("encryption.dropzone.input");
    await act(async () => {
      fireEvent.change(input, { target: { files: [makeEmptyTxt()] } });
    });
    // No processing/done UI
    expect(
      screen.queryByTestId("encryption.title.processing")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("encryption.title.done")
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("encryption.dropzone.wrap")).toBeInTheDocument();
    // Error message visible
    expect(screen.getByTestId("encryption.drop.error")).toHaveTextContent(
      /empty/i
    );
  });

  it("flows: drop .txt → processing → done; results appear and actions are disabled", async () => {
    render(<Encryption />);
    const input = screen.getByTestId("encryption.dropzone.input");
    const file = makeTxtFile();

    // Drop txt file
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    // Processing shows
    expect(screen.getByTestId("encryption.title.processing")).toHaveTextContent(
      /Encrypting/i
    );

    // Finish simulated processing (500ms)
    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    // Done state
    expect(screen.getByTestId("encryption.title.done")).toHaveTextContent(
      /complete/i
    );
    expect(
      screen.queryByTestId("encryption.dropzone.wrap")
    ).not.toBeInTheDocument();

    // Results block, token placeholder, disabled buttons
    const results = screen.getByTestId("encryption.results");
    const tokenBlock = within(results).getByTestId("encryption.results.token");
    expect(
      within(tokenBlock).getByTestId("encryption.token.value")
    ).toBeInTheDocument();
    expect(
      within(tokenBlock).getByTestId("encryption.token.copy")
    ).toBeDisabled();
    expect(
      within(tokenBlock).getByTestId("encryption.download.encrypted")
    ).toBeDisabled();
  });

  it('supports "Encrypt another file" reset', async () => {
    render(<Encryption />);
    const input = screen.getByTestId("encryption.dropzone.input");

    // Drop a valid .txt and advance timers past the 500ms simulated processing
    await act(async () => {
      fireEvent.change(input, { target: { files: [makeTxtFile()] } });
    });
    await act(async () => {
      vi.runAllTimers(); // ensures the component's timeout has completed
    });

    // Now the results should be present
    const results = screen.getByTestId("encryption.results");
    const resetBtn = within(results).getByTestId("encryption.action.reset");
    expect(resetBtn).toBeInTheDocument();

    // Click reset
    await act(async () => {
      fireEvent.click(resetBtn);
    });

    // Back to initial state
    expect(screen.getByTestId("encryption.title")).toBeInTheDocument();
    expect(screen.getByTestId("encryption.dropzone.wrap")).toBeInTheDocument();
  });
});
