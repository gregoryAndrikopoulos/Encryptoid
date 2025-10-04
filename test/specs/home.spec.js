import { browser } from "@wdio/globals";
import HomePage from "../page-objects/HomePage.js";
import NavPage from "../page-objects/NavigationPage.js";

describe("Home screen", () => {
  it("renders header, nav (desktop), and home sections", async () => {
    await browser.setWindowSize(1400, 900);
    await HomePage.open("/");

    await (await HomePage.headerRoot).waitForDisplayed();
    await (await HomePage.headerLogo).waitForDisplayed();

    await (await NavPage.desktop).waitForDisplayed();
    await (await HomePage.page).waitForDisplayed();
    await (await HomePage.actionsGrid).waitForDisplayed();
    await (await HomePage.howto).waitForDisplayed();
    await (await HomePage.notes).waitForDisplayed();

    const headerLogoSrc = await (await HomePage.headerLogo).getAttribute("src");
    if (!headerLogoSrc.endsWith("/logo.png")) {
      throw new Error(
        `Expected header logo src to end with "/logo.png", got "${headerLogoSrc}"`
      );
    }
  });

  it("shows both cards with titles, texts, and correct hrefs", async () => {
    await HomePage.open("/");

    await (await HomePage.cardEncryption).waitForDisplayed();
    if (
      !/Encrypt a file/i.test(
        await (await HomePage.cardEncryptionTitle).getText()
      )
    ) {
      throw new Error("Encryption card title mismatch");
    }
    const encHref =
      (await (await HomePage.cardEncryption).getAttribute("href")) || "";
    if (!encHref.toLowerCase().includes("/encryption")) {
      throw new Error(
        `Expected encryption card href to include "/encryption", got "${encHref}"`
      );
    }

    await (await HomePage.cardDecryption).waitForDisplayed();
    if (
      !/Decrypt a file/i.test(
        await (await HomePage.cardDecryptionTitle).getText()
      )
    ) {
      throw new Error("Decryption card title mismatch");
    }
    const decHref =
      (await (await HomePage.cardDecryption).getAttribute("href")) || "";
    if (!decHref.toLowerCase().includes("/decryption")) {
      throw new Error(
        `Expected decryption card href to include "/decryption", got "${decHref}"`
      );
    }
  });

  it("contains 3 how-to steps and 3 notes", async () => {
    await HomePage.open("/");

    await (await HomePage.howtoList).waitForDisplayed();
    const howtoItems = await (await HomePage.howtoList).$$("li");
    if (howtoItems.length !== 3) {
      throw new Error(`Expected 3 how-to steps, found ${howtoItems.length}`);
    }
    await (await HomePage.howtoStepEncrypt).waitForDisplayed();
    await (await HomePage.howtoStepStore).waitForDisplayed();
    await (await HomePage.howtoStepDecrypt).waitForDisplayed();

    await (await HomePage.notesList).waitForDisplayed();
    const noteItems = await (await HomePage.notesList).$$("li");
    if (noteItems.length !== 3) {
      throw new Error(`Expected 3 notes, found ${noteItems.length}`);
    }
    await (await HomePage.noteItem1).waitForDisplayed();
    await (await HomePage.noteItem2).waitForDisplayed();
    await (await HomePage.noteItem3).waitForDisplayed();
  });

  it("navigates via cards and via existing NavigationPage helpers", async () => {
    await HomePage.open("/");

    await HomePage.goToEncryptionViaCard();
    {
      const url = await browser.getUrl();
      if (!url.toLowerCase().includes("/encryption")) {
        throw new Error(`Expected URL to include "/encryption", got "${url}"`);
      }
    }

    await (await NavPage.title).click();
    {
      const url = await browser.getUrl();
      if (!url.endsWith("/")) {
        throw new Error(
          `Expected to be back on home (ends with '/'), got "${url}"`
        );
      }
    }

    await HomePage.goToDecryptionViaCard();
    {
      const url = await browser.getUrl();
      if (!url.toLowerCase().includes("/decryption")) {
        throw new Error(`Expected URL to include "/decryption", got "${url}"`);
      }
    }

    await NavPage.goEncryption();
    {
      const url = await browser.getUrl();
      if (!url.toLowerCase().includes("/encryption")) {
        throw new Error(`Expected URL to include "/encryption", got "${url}"`);
      }
    }
  });
});
