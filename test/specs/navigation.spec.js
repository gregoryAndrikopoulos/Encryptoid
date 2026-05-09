import { browser } from "@wdio/globals";
import NavigationPage from "../page-objects/NavigationPage.js";

describe("Navbar (NavSwitcher + AppLink)", () => {
  it("renders desktop nav and navigates via test-ids", async () => {
    await browser.setWindowSize(1400, 900);
    await NavigationPage.open("/");

    await (await NavigationPage.desktop).waitForDisplayed();

    await (await NavigationPage.logo).waitForDisplayed();
    const logoSrc = await (await NavigationPage.logo).getAttribute("src");
    if (!String(logoSrc).includes("logo-nav.png")) {
      throw new Error(
        `Expected nav logo src to include "logo-nav.png", got "${logoSrc}"`
      );
    }

    await NavigationPage.goEncryptionDesktop();
    {
      const url = await browser.getUrl();
      if (!url.includes("/Encryption")) {
        throw new Error(`Expected URL to include "/Encryption", got "${url}"`);
      }
    }

    await NavigationPage.goDecryptionDesktop();
    {
      const url = await browser.getUrl();
      if (!url.includes("/Decryption")) {
        throw new Error(`Expected URL to include "/Decryption", got "${url}"`);
      }
    }
  });

  it("renders mobile nav and navigates via test-ids", async () => {
    await browser.setWindowSize(390, 844);
    await NavigationPage.open("/Decryption");

    await (await NavigationPage.mobile).waitForDisplayed();

    await NavigationPage.goHomeMobile();
    {
      const url = await browser.getUrl();
      if (!url.endsWith("/")) {
        throw new Error(`Expected home URL to end with "/", got "${url}"`);
      }
    }

    await NavigationPage.goEncryptionMobile();
    {
      const url = await browser.getUrl();
      if (!url.includes("/Encryption")) {
        throw new Error(`Expected URL to include "/Encryption", got "${url}"`);
      }
    }
  });
});
