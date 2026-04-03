import { Page, Locator, expect } from '@playwright/test';
import { ValidBikeInput } from '../types/bike';
import {
  MaintenanceItem,
  MaintenanceLogInput,
  MaintenanceScheduleInput,
} from '../types/maintenance';

export class MaintenancePage {
  readonly page: Page;
  readonly maintenanceScreenButton: Locator;
  readonly maintenanceScreen: Locator;
  readonly maintenanceScheduleModal: Locator;
  readonly maintenanceLogModal: Locator;
  readonly oilServiceCard: Locator;
  readonly logOilService: Locator;
  readonly coolantServiceCard: Locator;
  readonly logCoolantService: Locator;
  readonly logIntervalDoneAt: Locator;
  readonly logIntervalOdo: Locator;
  readonly logSubmitButton: Locator;
  readonly logCancelButton: Locator;
  readonly logServiceMessage: Locator;
  readonly scheduleOilService: Locator;
  readonly scheduleCoolantService: Locator;
  readonly scheduleIntervalKm: Locator;
  readonly scheduleIntervalDays: Locator;
  readonly scheduleSubmitButton: Locator;
  readonly scheduleCancelButton: Locator;
  readonly scheduleServiceMessage: Locator;
  readonly maintenanceHistoryContainer: Locator;
  readonly onTrackCount: Locator;
  readonly dueSoonCount: Locator;
  readonly overdueCount: Locator;
  readonly backToGarageButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.maintenanceScreenButton = this.page.locator('.bikeCard__main');
    this.maintenanceScreen = this.page.getByTestId('screen-bike');
    this.maintenanceLogModal = this.page.getByTestId('modal-log');
    this.maintenanceScheduleModal = this.page.getByTestId('modal-schedule');
    this.oilServiceCard = this.page.getByTestId('task-card-oil');
    this.logOilService = this.page.locator(
      '[data-testid="task-card-oil"] [data-testid="btn-log-service-oil"]',
    );
    this.coolantServiceCard = this.page.getByTestId('task-card-coolant');
    this.logCoolantService = this.page.locator(
      '[data-testid="task-card-coolant"] [data-testid="btn-log-service-coolant"]',
    );
    this.logIntervalDoneAt = this.page.getByTestId('log-doneAt');
    this.logIntervalOdo = this.page.getByTestId('log-odo');
    this.logSubmitButton = this.page.getByTestId('log-submit');
    this.logCancelButton = this.page.getByTestId('log-cancel');
    this.logServiceMessage = this.page.getByTestId('log-hint');
    this.scheduleOilService = this.page.locator(
      '[data-testid="task-card-oil"] [data-testid="btn-task-calendar-oil"]',
    );
    this.scheduleCoolantService = this.page.locator(
      '[data-testid="task-card-coolant"] [data-testid="btn-task-calendar-coolant"]',
    );
    this.scheduleIntervalKm = this.page.getByTestId('schedule-interval-km');
    this.scheduleIntervalDays = this.page.getByTestId('schedule-interval-days');
    this.scheduleSubmitButton = this.page.getByTestId('schedule-submit');
    this.scheduleCancelButton = this.page.getByTestId('schedule-cancel');
    this.scheduleServiceMessage = this.page.getByTestId('schedule-hint');
    this.maintenanceHistoryContainer = this.page.getByTestId('history-section');
    this.onTrackCount = this.page.getByTestId('stat-ok-count');
    this.dueSoonCount = this.page.getByTestId('stat-dueSoon-count');
    this.overdueCount = this.page.getByTestId('stat-overdue-count');
    this.backToGarageButton = this.page.getByTestId('btn-back-to-garage');
  }

  async gotoMaintenance(): Promise<void> {
    await this.maintenanceScreenButton.click();
    await expect(this.maintenanceScreen).toBeVisible();
  }

  async openMaintenanceLogModal(service: MaintenanceItem): Promise<void> {
    switch (service) {
      case 'oil-change':
        await this.logOilService.click();
        break;

      case 'coolant-change':
        await this.logCoolantService.click();
        break;
      default:
        throw new Error(`Unknown log service: ${service}`);
    }

    await expect(this.maintenanceLogModal).toBeVisible();
  }

  async fillMaintenanceLog(input: MaintenanceLogInput): Promise<void> {
    await this.logIntervalDoneAt.fill(input.doneAt);
    await this.logIntervalOdo.fill(String(input.odo));
  }

  async saveMaintenanceLog(): Promise<void> {
    await this.logSubmitButton.click();
  }

  async cancelMaintenanceLog(): Promise<void> {
    await this.logCancelButton.click();
  }

  async logMaintenance(input: MaintenanceLogInput): Promise<void> {
    await this.openMaintenanceLogModal(input.service);
    await this.fillMaintenanceLog({ ...input });
    await this.saveMaintenanceLog();
  }

  async openMaintenanceScheduleModal(service: MaintenanceItem): Promise<void> {
    switch (service) {
      case 'oil-change':
        await this.scheduleOilService.click();
        break;
      case 'coolant-change':
        await this.scheduleCoolantService.click();
        break;
      default:
        throw new Error(`Unknown schedule service: ${service}`);
    }

    await expect(this.maintenanceScheduleModal).toBeVisible();
  }

  async fillMaintenanceSchedule(
    input: MaintenanceScheduleInput,
  ): Promise<void> {
    await this.scheduleIntervalKm.fill(String(input.interval_km));
    await this.scheduleIntervalDays.fill(String(input.interval_days));
  }

  async saveMaintenanceSchedule(): Promise<void> {
    await this.scheduleSubmitButton.click();
  }

  async cancelMaintenanceSchedule(): Promise<void> {
    await this.scheduleCancelButton.click();
  }

  async scheduleMaintenance(input: MaintenanceScheduleInput): Promise<void> {
    await this.openMaintenanceScheduleModal(input.service);
    await this.fillMaintenanceSchedule({ ...input });
    await this.saveMaintenanceSchedule();
  }

  getTaskCard(taskId: string): Locator {
    switch (taskId) {
      case 'oil-change':
        return this.oilServiceCard;
      case 'coolant-change':
        return this.coolantServiceCard;
      default:
        throw new Error(`Unknown task id: ${taskId}`);
    }
  }

  getTaskField(taskId: string, field: 'last' | 'due'): Locator {
    return this.getTaskCard(taskId).locator(`[data-field="${field}"]`);
  }

  getBikeCard(make: string): Locator {
    return this.page.locator('.bikeCard__main').filter({
      hasText: make,
    });
  }

  async expectTaskFieldContains(
    taskId: string,
    field: 'last' | 'due',
    text: string,
  ): Promise<void> {
    await expect(this.getTaskField(taskId, field)).toContainText(text);
  }

  async expectStatusCounts(
    onTrack: string,
    dueSoon: string,
    overdue: string,
  ): Promise<void> {
    await expect(this.onTrackCount).toHaveText(onTrack);
    await expect(this.dueSoonCount).toHaveText(dueSoon);
    await expect(this.overdueCount).toHaveText(overdue);
  }

  async expectScheduleError(message: string): Promise<void> {
    await expect(this.scheduleServiceMessage).toContainText(message);
  }

  async expectLogError(message: string): Promise<void> {
    await expect(this.logServiceMessage).toContainText(message);
  }
}
