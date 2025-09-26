import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, within, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import Encryption from "../components/Encryption.jsx";
import { makeTxtFile } from "../../../../test-utils/files";

let fetchSpy;

describe("Encryption token copy", () => {
  beforeEach(() => {
    fetchSpy = vi.fn(async (input) => {
      const url = typeof input === "string" ? input : input?.url || "";
      if (url.includes("/api/encrypt")) {
        const token = "t".repeat(256);
        return new Response(
          JSON.stringify({
            ok: true,
            token,
            filename: "note.txt",
            plainSize: 4,
            encSize: 4,
            ciphertextB64: "AQIDBA==",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      return new Response("", { status: 404 });
    });
    vi.stubGlobal("fetch", fetchSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("copies the token to clipboard", async () => {
    const spy = vi.spyOn(navigator.clipboard, "writeText");

    render(<Encryption />);
    const dz = screen.getByTestId("encryption.dropzone.input");

    await act(async () => {
      fireEvent.change(dz, {
        target: { files: [makeTxtFile("note.txt", "test")] },
      });
    });

    const results = await screen.findByTestId("encryption.results");
    const tokenBlock = within(results).getByTestId("encryption.results.token");

    const tokenField = within(tokenBlock).getByTestId("encryption.token.value");
    expect(tokenField).toHaveValue("t".repeat(256)); // sanity check

    // Click Copy
    const copyBtn = within(tokenBlock).getByTestId("encryption.token.copy");
    expect(copyBtn).not.toBeDisabled();

    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("t".repeat(256));
  });
});
