import { browser } from "@wdio/globals";
import NavPage from "../page-objects/NavigationPage.js";

describe("Navbar (NavSwitcher + AppLink)", () => {
  it("renders desktop nav and navigates via test-ids", async () => {
    await browser.setWindowSize(1400, 900);
    await NavPage.open("/");

    await (await NavPage.desktop).waitForDisplayed();

    await (await NavPage.logo).waitForDisplayed();
    const logoSrc = await (await NavPage.logo).getAttribute("src");
    if (!String(logoSrc).includes("logo-nav.png")) {
      throw new Error(
        `Expected nav logo src to include "logo-nav.png", got "${logoSrc}"`
      );
    }

    await NavPage.goEncryption();
    {
      const url = await browser.getUrl();
      if (!url.includes("/Encryption")) {
        throw new Error(`Expected URL to include "/Encryption", got "${url}"`);
      }
    }

    await NavPage.goDecryption();
    {
      const url = await browser.getUrl();
      if (!url.includes("/Decryption")) {
        throw new Error(`Expected URL to include "/Decryption", got "${url}"`);
      }
    }
  });

  it("renders mobile nav and navigates via test-ids", async () => {
    await browser.setWindowSize(390, 844);
    await NavPage.open("/Decryption");

    await (await NavPage.mobile).waitForDisplayed();

    await NavPage.goHomeMobile();
    {
      const url = await browser.getUrl();
      if (!url.endsWith("/")) {
        throw new Error(`Expected home URL to end with "/", got "${url}"`);
      }
    }

    await NavPage.goEncryption();
    {
      const url = await browser.getUrl();
      if (!url.includes("/Encryption")) {
        throw new Error(`Expected URL to include "/Encryption", got "${url}"`);
      }
    }
  });
});
