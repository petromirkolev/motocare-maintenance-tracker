import { Page, Locator, expect } from '@playwright/test';

export class MaintenancePage {
  readonly page: Page;
  readonly openMaintenanceScreenButton: Locator;
  readonly maintenanceScreen: Locator;
  readonly maintenanceModal: Locator;
  readonly scheduleOilService: Locator;

  constructor(page: Page) {
    this.page = page;
    this.openMaintenanceScreenButton = this.page.locator('.bikeCard__main');
    this.maintenanceScreen = this.page.getByTestId('screen-bike');
    this.maintenanceModal = this.page.getByTestId('modal-schedule');
    this.scheduleOilService = this.page.locator(
      '[data-testid="task-card-oil"] > [data-testid="btn-task-calendar-oil"]',
    );
  }

  async goto(): Promise<void> {
    await this.openMaintenanceScreenButton.click();
    await expect(this.maintenanceScreen).toBeVisible();
  }
}
