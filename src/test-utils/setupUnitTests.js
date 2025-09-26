import "@testing-library/jest-dom/vitest";
import { afterAll } from "vitest";
import { webcrypto } from "node:crypto";

// crypto (for getRandomValues, etc.)
if (typeof globalThis.crypto === "undefined") {
  globalThis.crypto = webcrypto;
}
if (typeof window !== "undefined" && typeof window.crypto === "undefined") {
  window.crypto = globalThis.crypto;
}

// URL.{createObjectURL,revokeObjectURL} polyfills
// Keep simple, no-op, but present for jsdom so components can create/revoke blobs
const _createObjBackup = URL.createObjectURL;
const _revokeObjBackup = URL.revokeObjectURL;

// If not provided by jsdom, polyfill them
if (typeof URL.createObjectURL !== "function") {
  URL.createObjectURL = () => "blob:mock";
}
if (typeof URL.revokeObjectURL !== "function") {
  URL.revokeObjectURL = () => {};
}

// Optionally restore after all tests (not strictly necessary, but tidy)
afterAll(() => {
  URL.createObjectURL = _createObjBackup;

  URL.revokeObjectURL = _revokeObjBackup;
});

/* Clipboard polyfill for tests */
if (typeof globalThis.navigator === "undefined") {
  globalThis.navigator = {};
}
if (!globalThis.navigator.clipboard) {
  const store = { text: "" };
  globalThis.navigator.clipboard = {
    writeText: async (t) => {
      store.text = String(t ?? "");
    },
    readText: async () => store.text,
  };
}
