import { $, browser } from "@wdio/globals";
import DropzonePage from "./DropzonePage.js";

class EncryptionPage {
  constructor() {
    this.dropzone = new DropzonePage("encryption.dropzone");
  }

  get root() {
    return $('[data-testid="page.encryption"]');
  }
  get titleInitial() {
    return $('[data-testid="encryption.title"]');
  }
  get titleProcessing() {
    return $('[data-testid="encryption.title.processing"]');
  }
  get titleDone() {
    return $('[data-testid="encryption.title.done"]');
  }
  get results() {
    return $('[data-testid="encryption.results"]');
  }
  get tokenValue() {
    return $('[data-testid="encryption.token.value"]');
  }
  get tokenCopyBtn() {
    return $('[data-testid="encryption.token.copy"]');
  }
  get downloadEncryptedBtn() {
    return $('[data-testid="encryption.download.encrypted"]');
  }
  get resetBtn() {
    return $('[data-testid="encryption.action.reset"]');
  }
  get toastCopied() {
    return $('[data-testid="toast.token.copied"]');
  }

  async waitForCopiedToast() {
    await this.toastCopied.waitForDisplayed({ timeout: 5000 });
  }

  async open() {
    await browser.url("/");
    const link = await $('[data-testid="navlink-encryption"]');
    await link.waitForDisplayed({ timeout: 5000 });
    await link.click();
    await this.root.waitForDisplayed({ timeout: 5000 });
  }

  async waitProcessing() {
    await this.titleProcessing.waitForDisplayed({ timeout: 4000 });
  }
  async waitDone() {
    await this.titleDone.waitForDisplayed({ timeout: 5000 });
  }

  async reset() {
    await this.resetBtn.click();
    await this.titleInitial.waitForDisplayed({ timeout: 4000 });
    await this.dropzone.expectVisible();
  }
}

export default new EncryptionPage();
