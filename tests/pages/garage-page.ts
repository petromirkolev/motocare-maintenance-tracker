import { Page, Locator, expect } from '@playwright/test';

export class GaragePage {
  readonly page: Page;
  readonly garageScreen: Locator;
  readonly addBikeButton: Locator;
  readonly addBikeScreen: Locator;
  readonly addBikeMake: Locator;
  readonly addBikeModel: Locator;
  readonly addBikeYear: Locator;
  readonly addBikeOdo: Locator;
  readonly submitBikeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.garageScreen = this.page.getByTestId('screen-garage');
    this.addBikeButton = this.page.getByTestId('btn-add-bike');
    this.addBikeScreen = this.page.getByTestId('screen-bike-add');
    this.addBikeMake = this.page.getByTestId('add-bike-name');
    this.addBikeModel = this.page.getByTestId('add-bike-model');
    this.addBikeYear = this.page.getByTestId('add-bike-year');
    this.addBikeOdo = this.page.getByTestId('add-bike-odometer');
    this.submitBikeButton = this.page.getByTestId('btn-add-bike-save');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.garageScreen).toBeVisible();
  }

  async openAddBike(): Promise<void> {
    await this.addBikeButton.click();
    await expect(this.addBikeScreen).toBeVisible();
  }

  async fillBikeForm({ name, model, year, odometer }): Promise<void> {
    await this.addBikeMake.fill(name);
    await this.addBikeModel.fill(model);
    await this.addBikeYear.fill(year);
    await this.addBikeOdo.fill(odometer);
  }

  async submitBike(): Promise<void> {
    await this.submitBikeButton.click();
  }

  async expectBikeVisible(name: string): Promise<void> {
    await expect(this.page.getByTestId(/bike-name-/)).toHaveText(name);
  }

  // async expectError(message: string): Promise<void> {
  //   await expect(this.loginMessage).toContainText(message);
  // }

  // async expectSuccess(message: string): Promise<void> {
  //   await expect(this.loginMessage).toContainText(message);
  // }
}
