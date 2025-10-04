import { $, browser } from "@wdio/globals";
import DropzonePage from "./DropzonePage.js";

class DecryptionPage {
  constructor() {
    this.dropzone = new DropzonePage("decryption.dropzone"); // same PO, different id
  }

  get root() {
    return $('[data-testid="page.decryption"]');
  }
  get titleInitial() {
    return $('[data-testid="decryption.title"]');
  }
  get titleDone() {
    return $('[data-testid="decryption.title.done"]');
  }
  get tokenForm() {
    return $('[data-testid="decryption.token.form"]');
  }
  get tokenInput() {
    return $('[data-testid="decryption.token.input"]');
  }
  get tokenHelp() {
    return $('[data-testid="decryption.token.help"]');
  }
  get decryptBtn() {
    return $('[data-testid="decryption.action.decrypt"]');
  }
  get results() {
    return $('[data-testid="decryption.results"]');
  }
  get downloadBtn() {
    return $('[data-testid="decryption.download.decrypted"]');
  }
  get resetBtn() {
    return $('[data-testid="decryption.action.reset"]');
  }
  get dropHint() {
    return $('[data-testid="decryption.dropzone"] .dropzone-hint');
  }
  get dropSubhint() {
    return $('[data-testid="decryption.dropzone"] .dropzone-subhint');
  }
  get dropInfo() {
    return $('[data-testid="decryption.drop.info"]');
  }

  async open() {
    await browser.url("/");
    const link = await $('[data-testid="navlink-decryption"]');
    await link.waitForDisplayed({ timeout: 5000 });
    await link.click();
    await this.root.waitForDisplayed({ timeout: 5000 });
  }

  async typeToken(str) {
    await this.tokenInput.setValue(str);
  }
  async waitDone() {
    await this.titleDone.waitForDisplayed({ timeout: 5000 });
  }

  async reset() {
    await this.resetBtn.click();
    await this.titleInitial.waitForDisplayed({ timeout: 4000 });
  }
}

export default new DecryptionPage();
