import { Page, Locator, expect } from '@playwright/test';
import { InvalidBikeInput, ValidBikeInput } from '../types/bike';

export class GaragePage {
  readonly page: Page;
  readonly garageScreen: Locator;
  readonly garageGrid: Locator;
  readonly addBikeButton: Locator;
  readonly addBikeScreen: Locator;
  readonly addBikeMake: Locator;
  readonly addBikeModel: Locator;
  readonly addBikeYear: Locator;
  readonly addBikeOdo: Locator;
  readonly submitBikeButton: Locator;
  readonly addBikeMessage: Locator;
  readonly editBikeButton: Locator;
  readonly editBikeScreen: Locator;
  readonly editBikeMake: Locator;
  readonly editBikeModel: Locator;
  readonly editBikeYear: Locator;
  readonly editBikeOdo: Locator;
  readonly editBikeSaveButton: Locator;
  readonly editBikeCancelButton: Locator;
  readonly editBikeMessage: Locator;
  readonly deleteBikeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.garageScreen = this.page.getByTestId('screen-garage');
    this.garageGrid = this.page.getByTestId('garage-grid');
    this.addBikeButton = this.page.getByTestId('btn-add-bike');
    this.addBikeScreen = this.page.getByTestId('screen-bike-add');
    this.addBikeMake = this.page.getByTestId('add-bike-name');
    this.addBikeModel = this.page.getByTestId('add-bike-model');
    this.addBikeYear = this.page.getByTestId('add-bike-year');
    this.addBikeOdo = this.page.getByTestId('add-bike-odometer');
    this.submitBikeButton = this.page.getByTestId('btn-add-bike-save');
    this.addBikeMessage = this.page.getByTestId('add-hint');
    this.editBikeButton = this.page.getByTestId(/bike-edit-/);
    this.editBikeScreen = this.page.getByTestId('screen-bike-edit');
    this.editBikeMake = this.page.getByTestId('edit-bike-name');
    this.editBikeModel = this.page.getByTestId('edit-bike-model');
    this.editBikeYear = this.page.getByTestId('edit-bike-year');
    this.editBikeOdo = this.page.getByTestId('edit-bike-odometer');
    this.editBikeSaveButton = this.page.getByTestId('btn-edit-bike-save');
    this.editBikeCancelButton = this.page.getByTestId('btn-edit-bike-cancel');
    this.editBikeMessage = this.page.getByTestId('edit-bike-hint');
    this.deleteBikeButton = this.page.getByTestId(/bike-delete-/);
  }

  async expectGarageLoaded(): Promise<void> {
    await expect(this.garageScreen).toBeVisible();
  }

  async openAddBike(): Promise<void> {
    await this.addBikeButton.click();
    await expect(this.addBikeScreen).toBeVisible();
  }

  async openEditBike(): Promise<void> {
    await this.editBikeButton.click();
    await expect(this.editBikeScreen).toBeVisible();
  }

  async addBike(input: Partial<ValidBikeInput>): Promise<void> {
    await this.openAddBike();

    if (input.make !== undefined) await this.addBikeMake.fill(input.make);
    if (input.model !== undefined) await this.addBikeModel.fill(input.model);
    if (input.year !== undefined)
      await this.addBikeYear.fill(String(input.year));
    if (input.odo !== undefined) await this.addBikeOdo.fill(String(input.odo));

    await this.submitAddBike();
  }

  async editBike(input: ValidBikeInput): Promise<void> {
    await this.openEditBike();

    if (input.make !== undefined) await this.editBikeMake.fill(input.make);
    if (input.model !== undefined) await this.editBikeModel.fill(input.model);
    if (input.year !== undefined)
      await this.editBikeYear.fill(String(input.year));
    if (input.odo !== undefined) await this.editBikeOdo.fill(String(input.odo));

    await this.submitEditBike();
  }

  async submitAddBike(): Promise<void> {
    await this.submitBikeButton.click();
  }

  async submitEditBike(): Promise<void> {
    await this.editBikeSaveButton.click();
  }

  async cancelEditBike(): Promise<void> {
    await this.editBikeCancelButton.click();
  }

  async deleteBikeByName(name: string): Promise<void> {
    const bikeCard = this.page.locator('.bikeCard').filter({
      hasText: name,
    });

    await bikeCard.getByTestId(/bike-delete-/).click();
  }

  async expectBikeVisible(name: string): Promise<void> {
    await expect(this.garageGrid).toContainText(name);
  }

  async expectBikeNotVisible(name: string): Promise<void> {
    await expect(this.garageGrid).not.toContainText(name);
  }

  async expectError(message: string): Promise<void> {
    await expect(this.addBikeMessage).toContainText(message);
  }

  async expectSuccess(message: string): Promise<void> {
    await expect(this.addBikeMessage).toContainText(message);
  }

  async expectEditError(message: string): Promise<void> {
    await expect(this.editBikeMessage).toContainText(message);
  }

  async expectGarageVisible() {
    await expect(this.garageScreen).toBeVisible();
  }

  async expectGarageEmpty() {
    await expect(
      this.page.locator('[data-testid="garage-empty"]'),
    ).toBeVisible();
    await expect(
      this.page.locator('[data-testid="garage-empty"] .empty__title'),
    ).toHaveText('No motorcycles yet');
    await expect(
      this.page.locator('[data-testid="garage-empty"] .empty__sub'),
    ).toHaveText('Add your first bike to start tracking maintenance.');
  }
}
