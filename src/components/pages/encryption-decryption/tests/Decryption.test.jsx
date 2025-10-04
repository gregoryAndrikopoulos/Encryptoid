import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, within, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import Decryption from "../components/Decryption.jsx";
import {
  makeEncTxtFile,
  makeTxtFile,
  makeEmptyTxt,
} from "../../../../test-utils/files";

// Local helper for an empty .enc.txt file (UI expects .enc.txt for decrypt)
const makeEmptyEncTxt = () =>
  new File([""], "cipher.enc.txt", { type: "text/plain" });

let fetchSpy;

beforeEach(() => {
  // Stub ALL fetch calls for this suite.
  fetchSpy = vi.fn(async (input = {}) => {
    const url = typeof input === "string" ? input : input?.url || "";

    // Happy path for decrypt
    if (url.includes("/api/decrypt")) {
      const bytes = new Uint8Array([111, 107]); // "ok"
      return new Response(bytes, {
        status: 200,
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Disposition": 'attachment; filename="plain.dec.txt"',
        },
      });
    }

    return new Response("", { status: 404 });
  });
  vi.stubGlobal("fetch", fetchSpy);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Decryption (UI-only)", () => {
  it("renders initial heading + dropzone + token form", () => {
    render(<Decryption />);
    expect(screen.getByTestId("decryption.title")).toBeInTheDocument();
    expect(screen.getByTestId("decryption.dropzone.wrap")).toBeInTheDocument();
    expect(screen.getByTestId("decryption.dropzone")).toBeInTheDocument();
    expect(screen.getByTestId("decryption.token.form")).toBeInTheDocument();
  });

  it("rejects invalid files with appropriate messages", async () => {
    render(<Decryption />);
    const dzInput = screen.getByTestId("decryption.dropzone.input");

    const cases = [
      { file: makeEmptyTxt("empty.txt"), expected: /\.enc\.txt/i }, // force plain .txt
      { file: makeTxtFile(), expected: /\.enc\.txt/i }, // wrong extension
      { file: makeEmptyEncTxt(), expected: /empty/i }, // empty encrypted
    ];

    for (const { file, expected } of cases) {
      await act(async () => {
        fireEvent.change(dzInput, { target: { files: [file] } });
      });
      expect(screen.getByTestId("decryption.drop.error")).toHaveTextContent(
        expected
      );
      expect(screen.getByTestId("decryption.action.decrypt")).toBeDisabled();
    }
  });

  it("keeps Decrypt disabled until an .enc.txt is selected AND token length is 256", async () => {
    render(<Decryption />);
    const decryptBtn = screen.getByTestId("decryption.action.decrypt");
    const tokenInput = screen.getByTestId("decryption.token.input");
    expect(decryptBtn).toBeDisabled();

    await act(async () => {
      fireEvent.change(tokenInput, { target: { value: "a".repeat(256) } });
    });
    expect(decryptBtn).toBeDisabled();

    const input = screen.getByTestId("decryption.dropzone.input");
    await act(async () => {
      fireEvent.change(input, { target: { files: [makeEncTxtFile()] } });
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

  it("flows: drop .enc.txt + valid token → done; results shown; download is enabled", async () => {
    render(<Decryption />);

    const dzInput = screen.getByTestId("decryption.dropzone.input");
    await act(async () => {
      fireEvent.change(dzInput, { target: { files: [makeEncTxtFile()] } });
    });

    const tokenInput = screen.getByTestId("decryption.token.input");
    await act(async () => {
      fireEvent.change(tokenInput, { target: { value: "x".repeat(256) } });
    });

    const decryptBtn = screen.getByTestId("decryption.action.decrypt");
    expect(decryptBtn).not.toBeDisabled();

    await act(async () => {
      fireEvent.click(decryptBtn);
    });

    // Verify request shape
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [calledUrl, init] = fetchSpy.mock.calls[0];
    expect(String(calledUrl)).toMatch(/\/api\/decrypt$/);
    expect(init.method).toBe("POST");
    expect(init.body).toBeInstanceOf(FormData);

    expect(
      await screen.findByTestId("decryption.title.done")
    ).toBeInTheDocument();

    const results = screen.getByTestId("decryption.results");
    const downloadLink = within(results).getByTestId(
      "decryption.download.decrypted"
    );
    expect(downloadLink).toHaveAttribute("href", "blob:mock");
    expect(downloadLink).toHaveAttribute(
      "download",
      expect.stringMatching(/\.dec\.txt$/)
    );
  });

  it("shows a user-visible error when server returns 400/500", async () => {
    // Make next call fail
    fetchSpy.mockImplementationOnce(async () => {
      return new Response(JSON.stringify({ ok: false, error: "Bad token" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    });

    render(<Decryption />);

    const dzInput = screen.getByTestId("decryption.dropzone.input");
    await act(async () => {
      fireEvent.change(dzInput, { target: { files: [makeEncTxtFile()] } });
    });

    const tokenInput = screen.getByTestId("decryption.token.input");
    await act(async () => {
      fireEvent.change(tokenInput, { target: { value: "x".repeat(256) } });
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("decryption.action.decrypt"));
    });

    // Expect a generic failure message in UI
    expect(
      await screen.findByText(/fail|error|unavailable/i)
    ).toBeInTheDocument();

    // No results block on failure
    expect(screen.queryByTestId("decryption.results")).not.toBeInTheDocument();
  });

  it('supports "Decrypt another file" reset', async () => {
    render(<Decryption />);

    const dzInput = screen.getByTestId("decryption.dropzone.input");
    await act(async () => {
      fireEvent.change(dzInput, { target: { files: [makeEncTxtFile()] } });
    });
    const tokenInput = screen.getByTestId("decryption.token.input");
    await act(async () => {
      fireEvent.change(tokenInput, { target: { value: "x".repeat(256) } });
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("decryption.action.decrypt"));
    });

    const results = await screen.findByTestId("decryption.results");
    const resetBtn = within(results).getByTestId("decryption.action.reset");
    expect(resetBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(resetBtn);
    });

    expect(screen.getByTestId("decryption.title")).toBeInTheDocument();
    expect(screen.getByTestId("decryption.dropzone.wrap")).toBeInTheDocument();
    expect(screen.getByTestId("decryption.token.form")).toBeInTheDocument();
  });

  it("updates dropzone title/subhint and shows file info after valid .enc.txt drop", async () => {
    render(<Decryption />);

    const dzRoot = screen.getByTestId("decryption.dropzone");
    const dzInput = screen.getByTestId("decryption.dropzone.input");

    const chosen = new File(["secret"], "chosen.enc.txt", {
      type: "text/plain",
    });

    await act(async () => {
      fireEvent.change(dzInput, { target: { files: [chosen] } });
    });

    expect(
      within(dzRoot).getByText(/Selected:\s*chosen\.enc\.txt/i)
    ).toBeInTheDocument();

    expect(
      within(dzRoot).getByText(/Drop another \.enc\.txt to replace/i)
    ).toBeInTheDocument();

    const info = screen.getByTestId("decryption.drop.info");
    expect(info).toBeInTheDocument();
    expect(info).toHaveTextContent(/File ready:\s*chosen\.enc\.txt/i);
  });

  it("replaces previously selected file when another valid .enc.txt is dropped", async () => {
    render(<Decryption />);

    const dzRoot = screen.getByTestId("decryption.dropzone");
    const dzInput = screen.getByTestId("decryption.dropzone.input");

    const first = new File(["aaa"], "first.enc.txt", { type: "text/plain" });
    const second = new File(["bbb"], "second.enc.txt", { type: "text/plain" });

    await act(async () => {
      fireEvent.change(dzInput, { target: { files: [first] } });
    });
    expect(
      within(dzRoot).getByText(/Selected:\s*first\.enc\.txt/i)
    ).toBeInTheDocument();

    await act(async () => {
      fireEvent.change(dzInput, { target: { files: [second] } });
    });

    expect(
      within(dzRoot).queryByText(/Selected:\s*first\.enc\.txt/i)
    ).not.toBeInTheDocument();
    expect(
      within(dzRoot).getByText(/Selected:\s*second\.enc\.txt/i)
    ).toBeInTheDocument();
    expect(
      within(dzRoot).getByText(/Drop another \.enc\.txt to replace/i)
    ).toBeInTheDocument();

    const info = screen.getByTestId("decryption.drop.info");
    expect(info).toHaveTextContent(/second\.enc\.txt/i);
  });

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
