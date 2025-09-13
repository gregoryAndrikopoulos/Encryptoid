import { $ } from "@wdio/globals";

class NavigationPage {
  get desktop() {
    return $('[data-testid="nav-desktop"]');
  }
  get title() {
    return $('[data-testid="nav-title"]');
  }
  get linkEncryption() {
    return $('[data-testid="navlink-encryption"]');
  }
  get linkDecryption() {
    return $('[data-testid="navlink-decryption"]');
  }
  get mobile() {
    return $('[data-testid="nav-mobile"]');
  }
  get linkHomeMobile() {
    return $('[data-testid="navlink-home"]');
  }

  async open(path = "/") {
    await browser.url(path);
  }

  async goEncryption() {
    await (await this.linkEncryption).waitForDisplayed();
    await (await this.linkEncryption).click();
  }

  async goDecryption() {
    await (await this.linkDecryption).waitForDisplayed();
    await (await this.linkDecryption).click();
  }

  async goHomeMobile() {
    await (await this.linkHomeMobile).waitForDisplayed();
    await (await this.linkHomeMobile).click();
  }
}

export default new NavigationPage();
