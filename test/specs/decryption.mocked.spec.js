import path from "node:path";
import { browser } from "@wdio/globals";
import DecryptionPO from "../page-objects/DecryptionPage.js";

const FIXTURES = path.resolve(process.cwd(), "test/fixtures");
const ENC_GOOD = path.join(FIXTURES, "cipher.enc.txt");
const ENC_EMPTY = path.join(FIXTURES, "empty.enc.txt");
const TOKEN_LEN = 256;

async function mockDecryptOnce(
  filename = "cipher.dec.txt",
  body = "decrypted content"
) {
  await browser.execute(
    (fname, text) => {
      const orig = window.fetch;
      // one-shot guard
      window.__mockDecryptOnce = true;
      window.fetch = async (input, init) => {
        const url = typeof input === "string" ? input : input?.url || "";
        if (window.__mockDecryptOnce && url.includes("/api/decrypt")) {
          window.__mockDecryptOnce = false;
          const enc = new TextEncoder().encode(text);
          const blob = new Blob([enc], { type: "application/octet-stream" });
          const headers = new Headers({
            "content-type": "application/octet-stream",
            "content-disposition": `attachment; filename="${fname}"`,
          });
          return new Response(blob, { status: 200, statusText: "OK", headers });
        }
        return orig(input, init);
      };
    },
    filename,
    body
  );
}

describe("Decryption page (E2E)", () => {
  beforeEach(async () => {
    await browser.setWindowSize(1400, 900);
    await DecryptionPO.open();
    const url = await browser.getUrl();
    if (!url.includes("/Decryption")) {
      throw new Error(`Expected to be on /Decryption, got "${url}"`);
    }
  });

  it("renders initial heading + directive + dropzone + token form", async () => {
    await DecryptionPO.dropzone.expectVisible();
    if (!(await DecryptionPO.tokenForm.isDisplayed()))
      throw new Error("Token form should be visible");
  });

  it("rejects empty .enc.txt file (inline error)", async () => {
    await DecryptionPO.dropzone.uploadLocalFile(ENC_EMPTY);

    const errText = await DecryptionPO.dropzone.error.getText();
    if (!/empty/i.test(errText)) {
      throw new Error(
        `Expected inline error to mention "empty", got "${errText}"`
      );
    }

    if (await DecryptionPO.decryptBtn.isEnabled()) {
      throw new Error("Decrypt should remain disabled");
    }
  });

  it("keeps Decrypt disabled until .enc.txt + 256-char token", async () => {
    if (await DecryptionPO.decryptBtn.isEnabled()) {
      throw new Error("Decrypt should be disabled initially");
    }

    await DecryptionPO.typeToken("a".repeat(TOKEN_LEN));
    if (await DecryptionPO.decryptBtn.isEnabled()) {
      throw new Error(
        "Decrypt should still be disabled until a file is picked"
      );
    }

    await DecryptionPO.dropzone.uploadLocalFile(ENC_GOOD);

    const hintText = (await DecryptionPO.dropHint.getText()) || "";
    if (!/Selected:\s*cipher\.enc\.txt/i.test(hintText)) {
      throw new Error(
        `Expected hint to show "Selected: cipher.enc.txt", got "${hintText}"`
      );
    }

    const subhintText = (await DecryptionPO.dropSubhint.getText()) || "";
    if (!/Drop another \.enc\.txt to replace/i.test(subhintText)) {
      throw new Error(
        `Expected subhint to say "Drop another .enc.txt to replace", got "${subhintText}"`
      );
    }

    if (!(await DecryptionPO.dropInfo.isDisplayed())) {
      throw new Error("Expected file info line to be visible after valid drop");
    }
    const infoText = (await DecryptionPO.dropInfo.getText()) || "";
    if (!/File ready:\s*cipher\.enc\.txt/i.test(infoText)) {
      throw new Error(
        `Expected file info to include "cipher.enc.txt", got "${infoText}"`
      );
    }

    if (!(await DecryptionPO.decryptBtn.isEnabled())) {
      throw new Error("Decrypt should be enabled after valid file + token");
    }
  });

  it("shows token help and aria-invalid when token length is non-empty but not 256", async () => {
    await DecryptionPO.typeToken("short");

    if (!(await DecryptionPO.tokenHelp.isDisplayed()))
      throw new Error("Token help should be shown");
    const txt = await DecryptionPO.tokenHelp.getText();
    if (!/exactly 256 characters/i.test(txt)) {
      throw new Error(
        `Expected help to mention "exactly 256 characters", got "${txt}"`
      );
    }

    const ariaInvalid =
      await DecryptionPO.tokenInput.getAttribute("aria-invalid");
    if (ariaInvalid !== "true") {
      throw new Error(`Expected aria-invalid="true", got "${ariaInvalid}"`);
    }
  });

  it("flow: .enc.txt + valid token → processing → done; results shown; download enabled", async () => {
    await DecryptionPO.dropzone.uploadLocalFile(ENC_GOOD);
    await DecryptionPO.typeToken("x".repeat(TOKEN_LEN));

    // Mock the decrypt endpoint for this one flow
    await mockDecryptOnce("cipher.dec.txt", "ok");

    await DecryptionPO.decryptBtn.scrollIntoView();
    await DecryptionPO.decryptBtn.click();

    // Your component sets status to "done" on successful decrypt
    await DecryptionPO.waitDone();

    if (!(await DecryptionPO.results.isDisplayed()))
      throw new Error("Results should be visible");

    if (!(await DecryptionPO.downloadBtn.isEnabled())) {
      throw new Error("Download should be enabled after successful decrypt");
    }
  });

  it('supports "Decrypt another file" reset (form cleared)', async () => {
    await DecryptionPO.dropzone.uploadLocalFile(ENC_GOOD);
    await DecryptionPO.typeToken("x".repeat(TOKEN_LEN));

    // Mock again for this test
    await mockDecryptOnce("cipher.dec.txt", "ok");

    await DecryptionPO.decryptBtn.scrollIntoView();
    await DecryptionPO.decryptBtn.click();
    await DecryptionPO.waitDone();

    await DecryptionPO.reset();
    await DecryptionPO.dropzone.expectVisible();

    const val = await DecryptionPO.tokenInput.getValue();
    if (val !== "") {
      throw new Error(
        `Expected token input to be empty after reset, got length ${val.length}`
      );
    }
    if (!(await DecryptionPO.tokenForm.isDisplayed()))
      throw new Error("Token form should be visible after reset");
  });
});
