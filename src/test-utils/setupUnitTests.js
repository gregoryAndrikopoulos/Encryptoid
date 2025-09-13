import "@testing-library/jest-dom/vitest";
import { webcrypto } from "node:crypto";

// Ensure crypto.getRandomValues exists (used by the generator)
if (typeof globalThis.crypto === "undefined") {
  globalThis.crypto = webcrypto;
}

if (typeof window !== "undefined" && typeof window.crypto === "undefined") {
  window.crypto = globalThis.crypto;
}
