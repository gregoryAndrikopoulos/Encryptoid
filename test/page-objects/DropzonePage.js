import { $, browser } from "@wdio/globals";

export default class DropzonePage {
  constructor(baseTestId) {
    this.base = baseTestId; // e.g. "encryption.dropzone" or "decryption.dropzone"
  }

  get wrap() {
    return $(`[data-testid="${this.base}.wrap"]`);
  }
  get root() {
    return $(`[data-testid="${this.base}"]`);
  }
  get input() {
    return $(`[data-testid="${this.base}.input"]`);
  }

  get error() {
    const errId = this.base.replace(".dropzone", ".drop.error");
    return $(`[data-testid="${errId}"]`);
  }

  async uploadLocalFile(localPath) {
    const remote = await browser.uploadFile(localPath);
    await this.input.setValue(remote);
  }

  async expectVisible() {
    await this.wrap.waitForDisplayed({ timeout: 5000 });
    await this.root.waitForDisplayed({ timeout: 5000 });
  }
}
