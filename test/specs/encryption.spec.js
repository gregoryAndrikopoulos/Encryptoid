import path from "node:path";
import { browser } from "@wdio/globals";
import EncryptionPO from "../page-objects/EncryptionPage.js";

const FIXTURES = path.resolve(process.cwd(), "test/fixtures");
const TXT_GOOD = path.join(FIXTURES, "sample.txt");
const TXT_EMPTY = path.join(FIXTURES, "empty.txt");
const PNG_FILE = path.join(FIXTURES, "image.png");

describe("Encryption page (E2E)", () => {
  beforeEach(async () => {
    await browser.setWindowSize(1400, 900);
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

  it("rejects non-.txt files and stays on initial state (shows inline error)", async () => {
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

  it("flows: drop .txt → processing → done; results appear and actions disabled", async () => {
    await EncryptionPO.dropzone.uploadLocalFile(TXT_GOOD);
    await EncryptionPO.waitProcessing();
    await EncryptionPO.waitDone();

    if (!(await EncryptionPO.results.isDisplayed()))
      throw new Error("Results should be visible");
    if (!(await EncryptionPO.tokenValue.isDisplayed()))
      throw new Error("Token field should be visible");

    if (await EncryptionPO.tokenCopyBtn.isEnabled()) {
      throw new Error("Copy button must be disabled in this PR");
    }
    if (await EncryptionPO.downloadEncryptedBtn.isEnabled()) {
      throw new Error("Download button must be disabled in this PR");
    }
  });

  it('supports "Encrypt another file" reset', async () => {
    await EncryptionPO.dropzone.uploadLocalFile(TXT_GOOD);
    await EncryptionPO.waitDone();
    await EncryptionPO.reset();
  });
});
