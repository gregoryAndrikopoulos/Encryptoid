// test/specs/encryption.mocked.spec.js
import path from "node:path";
import { browser } from "@wdio/globals";
import EncryptionPO from "../page-objects/EncryptionPage.js";

const FIXTURES = path.resolve(process.cwd(), "test/fixtures");
const TXT_GOOD = path.join(FIXTURES, "sample.txt");
const TXT_EMPTY = path.join(FIXTURES, "empty.txt"); // <-- fix: this is for encryption
const PNG_FILE = path.join(FIXTURES, "image.png");

// One-shot mock for /api/encrypt (restores fetch immediately after use)
async function mockEncryptOnce({
  token = "x".repeat(256),
  filename = "sample.txt",
  plaintextSize = 5,
  ciphertext = new Uint8Array([1, 2, 3, 4]), // arbitrary bytes
} = {}) {
  const ciphertextB64 = Buffer.from(ciphertext).toString("base64");
  await browser.execute(
    (resp) => {
      const originalFetch = window.fetch;
      let armed = true;

      window.fetch = async (input, init) => {
        try {
          const url =
            typeof input === "string" ? input : (input && input.url) || "";
          if (armed && url.includes("/api/encrypt")) {
            armed = false;
            window.fetch = originalFetch; // restore immediately

            const body = JSON.stringify({
              ok: true,
              token: resp.token,
              filename: resp.filename,
              plainSize: resp.plaintextSize,
              encSize: resp.ciphertextB64.length, // not used by UI but included
              ciphertextB64: resp.ciphertextB64,
            });
            return new Response(body, {
              status: 200,
              headers: { "content-type": "application/json" },
            });
          }
          return originalFetch(input, init);
        } catch (err) {
          window.fetch = originalFetch; // restore on error too
          throw err;
        }
      };
    },
    { token, filename, plaintextSize, ciphertextB64 }
  );
}

describe("Encryption page (E2E / mocked API)", () => {
  beforeEach(async () => {
    await EncryptionPO.open();
    const url = await browser.getUrl();
    if (!url.includes("/Encryption")) {
      throw new Error(`Expected to be on /Encryption, got "${url}"`);
    }
  });

  it("renders initial heading + directive + dropzone", async () => {
    await EncryptionPO.dropzone.expectVisible();

    const heading = await EncryptionPO.titleInitial.getText();
    if (!/Commencing file Encryption/i.test(heading)) {
      throw new Error(
        `Expected heading to include "Commencing file Encryption", got "${heading}"`
      );
    }

    if (!(await EncryptionPO.directive.isDisplayed())) {
      throw new Error("Directive should be visible");
    }
  });

  it("rejects non-.txt files and stays on initial state (inline error)", async () => {
    await EncryptionPO.dropzone.uploadLocalFile(PNG_FILE);

    if (await EncryptionPO.titleDone.isExisting()) {
      throw new Error("Should not reach done state for non-.txt");
    }
    if (!(await EncryptionPO.dropzone.wrap.isDisplayed())) {
      throw new Error("Dropzone wrapper should remain visible");
    }

    const errText = await EncryptionPO.dropzone.error.getText();
    if (!/only \.txt/i.test(errText)) {
      throw new Error(
        `Expected inline error mentioning ".txt", got "${errText}"`
      );
    }
  });

  it("rejects empty .txt file and shows inline error", async () => {
    await EncryptionPO.dropzone.uploadLocalFile(TXT_EMPTY);

    if (await EncryptionPO.titleProcessing.isExisting()) {
      throw new Error("Should not show processing for empty file");
    }
    if (await EncryptionPO.titleDone.isExisting()) {
      throw new Error("Should not show done for empty file");
    }

    const errText = await EncryptionPO.dropzone.error.getText();
    if (!/empty/i.test(errText)) {
      throw new Error(
        `Expected inline error to mention "empty", got "${errText}"`
      );
    }
  });

  it("flows: drop .txt → done; results appear; copy & download enabled", async () => {
    // Patch fetch BEFORE selecting the file (Encryption triggers on file change)
    await mockEncryptOnce({
      filename: "sample.txt",
      plaintextSize: 5,
      ciphertext: new Uint8Array([1, 2, 3, 4]),
    });

    await EncryptionPO.dropzone.uploadLocalFile(TXT_GOOD);

    // Processing can be very brief under mock; wait directly for done
    await EncryptionPO.waitDone();

    if (!(await EncryptionPO.results.isDisplayed()))
      throw new Error("Results should be visible");
    if (!(await EncryptionPO.tokenValue.isDisplayed()))
      throw new Error("Token field should be visible");

    // In mocked mode we expect actions to be enabled (UI reads from response)
    if (!(await EncryptionPO.tokenCopyBtn.isEnabled())) {
      throw new Error("Copy button should be enabled in mocked mode");
    }
    if (!(await EncryptionPO.downloadEncryptedBtn.isEnabled())) {
      throw new Error("Download button should be enabled in mocked mode");
    }
  });

  it('supports "Encrypt another file" reset', async () => {
    await mockEncryptOnce({
      filename: "sample.txt",
      plaintextSize: 5,
      ciphertext: new Uint8Array([1, 2, 3, 4]),
    });

    await EncryptionPO.dropzone.uploadLocalFile(TXT_GOOD);
    await EncryptionPO.waitDone();
    await EncryptionPO.reset();
  });
});
