import path from "node:path";
import { browser } from "@wdio/globals";
import DecryptionPO from "../page-objects/DecryptionPage.js";

const FIXTURES = path.resolve(process.cwd(), "test/fixtures");
const TXT_GOOD = path.join(FIXTURES, "cipher.encrypted.txt");
const TXT_EMPTY = path.join(FIXTURES, "empty.txt");
const TOKEN_LEN = 256;

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

  it("rejects empty .txt file (inline error)", async () => {
    await DecryptionPO.dropzone.uploadLocalFile(TXT_EMPTY);

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

  it("keeps Decrypt disabled until .txt + 256-char token", async () => {
    if (await DecryptionPO.decryptBtn.isEnabled()) {
      throw new Error("Decrypt should be disabled initially");
    }

    await DecryptionPO.typeToken("a".repeat(TOKEN_LEN));
    if (await DecryptionPO.decryptBtn.isEnabled()) {
      throw new Error(
        "Decrypt should still be disabled until a file is picked"
      );
    }

    await DecryptionPO.dropzone.uploadLocalFile(TXT_GOOD);
    if (!(await DecryptionPO.decryptBtn.isEnabled())) {
      throw new Error("Decrypt should be enabled after valid file + token");
    }
  });

  it("shows token help and aria-invalid when token length is non-empty but not 256", async () => {
    await DecryptionPO.typeToken("short");

    // help text
    if (!(await DecryptionPO.tokenHelp.isDisplayed()))
      throw new Error("Token help should be shown");
    const txt = await DecryptionPO.tokenHelp.getText();
    if (!/exactly 256 characters/i.test(txt)) {
      throw new Error(
        `Expected help to mention "exactly 256 characters", got "${txt}"`
      );
    }

    // aria-invalid reflects invalid length
    const ariaInvalid =
      await DecryptionPO.tokenInput.getAttribute("aria-invalid");
    if (ariaInvalid !== "true") {
      throw new Error(`Expected aria-invalid="true", got "${ariaInvalid}"`);
    }
  });

  it("flow: .txt + valid token → processing → done; results shown; download disabled", async () => {
    await DecryptionPO.dropzone.uploadLocalFile(TXT_GOOD);
    await DecryptionPO.typeToken("x".repeat(TOKEN_LEN));

    await DecryptionPO.decryptBtn.click();
    await DecryptionPO.waitDone();

    if (!(await DecryptionPO.results.isDisplayed()))
      throw new Error("Results should be visible");
    if (await DecryptionPO.downloadBtn.isEnabled()) {
      throw new Error("Download should be disabled in this PR");
    }
  });

  it('supports "Decrypt another file" reset (form cleared)', async () => {
    await DecryptionPO.dropzone.uploadLocalFile(TXT_GOOD);
    await DecryptionPO.typeToken("x".repeat(TOKEN_LEN));
    await DecryptionPO.decryptBtn.click();
    await DecryptionPO.waitDone();

    await DecryptionPO.reset();
    await DecryptionPO.dropzone.expectVisible();

    // token input should be empty after reset
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
