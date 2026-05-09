import { $, browser } from "@wdio/globals";

class NavigationPage {
  get desktop() {
    return $('[data-testid="nav-desktop"]');
  }
  get mobile() {
    return $('[data-testid="nav-mobile"]');
  }
  get title() {
    return $('[data-testid="nav-title"]');
  }
  get logo() {
    return $('[data-testid="nav-logo"]');
  }
  get desktopEncryptionLink() {
    return this.desktop.$('[data-testid="navlink-encryption"]');
  }
  get desktopDecryptionLink() {
    return this.desktop.$('[data-testid="navlink-decryption"]');
  }
  get mobileHomeLink() {
    return this.mobile.$('[data-testid="navlink-home"]');
  }
  get mobileEncryptionLink() {
    return this.mobile.$('[data-testid="navlink-encryption"]');
  }
  get mobileDecryptionLink() {
    return this.mobile.$('[data-testid="navlink-decryption"]');
  }

  async open(path = "/") {
    await browser.url(path);
  }

  async goEncryptionDesktop() {
    await this.desktopEncryptionLink.waitForDisplayed();
    await this.desktopEncryptionLink.click();
  }

  async goDecryptionDesktop() {
    await this.desktopDecryptionLink.waitForDisplayed();
    await this.desktopDecryptionLink.click();
  }

  async goHomeMobile() {
    await this.mobileHomeLink.waitForDisplayed();
    await this.mobileHomeLink.click();
  }

  async goEncryptionMobile() {
    await this.mobileEncryptionLink.waitForDisplayed();
    await this.mobileEncryptionLink.click();
  }

  async goDecryptionMobile() {
    await this.mobileDecryptionLink.waitForDisplayed();
    await this.mobileDecryptionLink.click();
  }
}

export default new NavigationPage();
