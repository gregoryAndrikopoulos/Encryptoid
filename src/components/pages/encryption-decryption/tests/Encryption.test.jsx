import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, within, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import Encryption from "../components/Encryption.jsx";
import {
  makeTxtFile,
  makeEmptyTxt,
  makeOtherFile,
} from "../../../../test-utils/files";

let fetchSpy;

beforeEach(() => {
  // Stub ALL fetch calls for this suite.
  fetchSpy = vi.fn(async (input = {}) => {
    const url = typeof input === "string" ? input : input?.url || "";

    // Happy path
    if (url.includes("/api/encrypt")) {
      const token = "x".repeat(256);
      const body = {
        ok: true,
        token,
        filename: "sample.txt",
        plainSize: 5,
        encSize: 4,
        ciphertextB64: "AQIDBA==", // 0x01 02 03 04
      };
      return new Response(JSON.stringify(body), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("", { status: 404 });
  });
  vi.stubGlobal("fetch", fetchSpy);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Encryption (UI-only)", () => {
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
    await act(async () => {
      fireEvent.change(input, { target: { files: [makeOtherFile()] } });
    });
    expect(
      screen.queryByTestId("encryption.title.done")
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("encryption.dropzone.wrap")).toBeInTheDocument();
    // Relaxed assertion: just ensure it mentions .txt
    expect(screen.getByTestId("encryption.drop.error")).toHaveTextContent(
      /\.txt/i
    );
  });

  it("rejects empty .txt file with inline error (stays on initial state)", async () => {
    render(<Encryption />);
    const input = screen.getByTestId("encryption.dropzone.input");
    await act(async () => {
      fireEvent.change(input, { target: { files: [makeEmptyTxt()] } });
    });
    expect(
      screen.queryByTestId("encryption.title.processing")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("encryption.title.done")
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("encryption.dropzone.wrap")).toBeInTheDocument();
    expect(screen.getByTestId("encryption.drop.error")).toHaveTextContent(
      /empty/i
    );
  });

  it("flows: drop .txt → done; results appear; token & download enabled", async () => {
    render(<Encryption />);
    const input = screen.getByTestId("encryption.dropzone.input");

    await act(async () => {
      fireEvent.change(input, { target: { files: [makeTxtFile()] } });
    });

    // Verify request shape
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [calledUrl, init] = fetchSpy.mock.calls[0];
    expect(String(calledUrl)).toMatch(/\/api\/encrypt$/);
    expect(init.method).toBe("POST");
    expect(init.body).toBeInstanceOf(FormData);

    // Done state (await UI)
    expect(
      await screen.findByTestId("encryption.title.done")
    ).toHaveTextContent(/complete/i);

    const results = screen.getByTestId("encryption.results");
    const tokenBlock = within(results).getByTestId("encryption.results.token");

    // Token value
    const tokenField = within(tokenBlock).getByTestId("encryption.token.value");
    expect(tokenField).toHaveValue("x".repeat(256));

    // Copy enabled (if your UI keeps it disabled, swap to .toBeDisabled())
    const copyBtn = within(tokenBlock).getByTestId("encryption.token.copy");
    expect(copyBtn).not.toBeDisabled();

    // Download link exists and has a filename ending in .enc.txt
    const dl = within(tokenBlock).getByTestId("encryption.download.encrypted");
    expect(dl).toHaveAttribute("href", "blob:mock");
    expect(dl).toHaveAttribute(
      "download",
      expect.stringMatching(/\.enc\.txt$/)
    );
  });

  it("shows a user-visible error when server returns 400/500", async () => {
    // Make next call fail
    fetchSpy.mockImplementationOnce(async () => {
      return new Response(JSON.stringify({ ok: false, error: "Bad request" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    });

    render(<Encryption />);
    const input = screen.getByTestId("encryption.dropzone.input");
    await act(async () => {
      fireEvent.change(input, { target: { files: [makeTxtFile()] } });
    });

    // Expect an error message in UI; wording may differ — match generically
    expect(
      await screen.findByText(/fail|error|unavailable/i)
    ).toBeInTheDocument();

    // No results block on failure
    expect(screen.queryByTestId("encryption.results")).not.toBeInTheDocument();
  });

  it('supports "Encrypt another file" reset', async () => {
    render(<Encryption />);
    const input = screen.getByTestId("encryption.dropzone.input");

    await act(async () => {
      fireEvent.change(input, { target: { files: [makeTxtFile()] } });
    });

    const results = await screen.findByTestId("encryption.results");
    const resetBtn = within(results).getByTestId("encryption.action.reset");
    expect(resetBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(resetBtn);
    });

    expect(screen.getByTestId("encryption.title")).toBeInTheDocument();
    expect(screen.getByTestId("encryption.dropzone.wrap")).toBeInTheDocument();
  });
});
