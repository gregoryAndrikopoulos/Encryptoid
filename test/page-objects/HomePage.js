import { $ } from "@wdio/globals";

class HomePage {
  get headerRoot() {
    return $('[data-testid="header.root"]');
  }
  get headerLogo() {
    return $('[data-testid="header.logo"]');
  }
  get page() {
    return $('[data-testid="page.home"]');
  }
  get actionsGrid() {
    return $('[data-testid="home.actions"]');
  }
  get cardEncryption() {
    return $('[data-testid="home.card.encryption"]');
  }
  get cardEncryptionTitle() {
    return $('[data-testid="home.card.encryption.title"]');
  }
  get cardDecryption() {
    return $('[data-testid="home.card.decryption"]');
  }
  get cardDecryptionTitle() {
    return $('[data-testid="home.card.decryption.title"]');
  }
  get howto() {
    return $('[data-testid="home.howto"]');
  }
  get howtoList() {
    return $('[data-testid="home.howto.list"]');
  }
  get howtoStepEncrypt() {
    return $('[data-testid="home.howto.step.encrypt"]');
  }
  get howtoStepStore() {
    return $('[data-testid="home.howto.step.store"]');
  }
  get howtoStepDecrypt() {
    return $('[data-testid="home.howto.step.decrypt"]');
  }
  get notes() {
    return $('[data-testid="home.notes"]');
  }
  get notesList() {
    return $('[data-testid="home.notes.list"]');
  }
  get noteItem1() {
    return $('[data-testid="home.notes.item.1"]');
  }
  get noteItem2() {
    return $('[data-testid="home.notes.item.2"]');
  }
  get noteItem3() {
    return $('[data-testid="home.notes.item.3"]');
  }

  async open(path = "/") {
    await browser.url(path);
  }

  async goToEncryptionViaCard() {
    await (await this.cardEncryption).waitForDisplayed();
    await (await this.cardEncryption).click();
  }

  async goToDecryptionViaCard() {
    await (await this.cardDecryption).waitForDisplayed();
    await (await this.cardDecryption).click();
  }
}

export default new HomePage();
