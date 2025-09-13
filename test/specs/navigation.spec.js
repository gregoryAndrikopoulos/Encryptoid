import { browser } from "@wdio/globals";
import NavPage from "../page-objects/NavigationPage.js";

describe("Navbar (NavSwitcher + AppLink)", () => {
  it("renders desktop nav and navigates via test-ids", async () => {
    await browser.setWindowSize(1400, 900);
    await NavPage.open("/");

    await (await NavPage.desktop).waitForDisplayed();
    const titleText = await (await NavPage.title).getText();
    if (titleText !== "Encryptoid") {
      throw new Error(`Expected title "Encryptoid", got "${titleText}"`);
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
      // home will be http://localhost:5173/ — check suffix rather than strict equality
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
