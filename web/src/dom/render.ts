/* Functions responsible for rendering the UI based on the current state of the application. These functions manipulate the DOM to display the appropriate screens and content to the user. */

import { dom } from './selectors';
import { getState } from '../state/state-storage';
import { createBikeCard } from '../ui/create-bike-card';
import { showScreen } from '../ui/show-screen';
import { req } from '../utils/dom-helper';
import { getCurrentUser } from '../state/auth-state';

export const render = {
  initialScreen(): void {
    this.errorMessage('', 'nav.login');
    showScreen('login');
  },

  registerScreen(): void {
    this.errorMessage('', 'nav.register');
    showScreen('register');
  },

  garageScreen(): void {
    showScreen('garage');

    const grid = req(dom.bikeGrid, 'bikeGrid');

    grid.innerHTML = '';

    const state = getState();
    const bikes = state.bikes;
    const currentUser = getCurrentUser();

    req(dom.userEmail, 'userEmail').textContent =
      `Hello, ${currentUser?.email}!`;
    req(dom.garageCount, 'garageCount').textContent =
      bikes.length > 1 || bikes.length === 0
        ? `${bikes.length} motorcycles`
        : `${bikes.length} motorcycle`;

    bikes.forEach((bike) => grid.appendChild(createBikeCard(bike)));

    bikes.length > 0
      ? req(dom.garageEmpty, 'garageEmpty').classList.add('is-hidden')
      : req(dom.garageEmpty, 'garageEmpty').classList.remove('is-hidden');
  },

  maintenanceScreen() {
    showScreen('bike');
  },

  addBikeScreen(): void {
    showScreen('bikeAdd');
  },

  editBikeScreen(): void {
    showScreen('bikeEdit');
  },

  openServiceModal(target: string): void {
    if (target === 'log.service')
      dom.maintenanceModal?.classList.remove('is-hidden');

    if (target === 'schedule.service')
      dom.maintenanceScheduleModal?.classList.remove('is-hidden');
  },

  closeServiceModal(): void {
    dom.maintenanceModal?.classList.add('is-hidden');
    dom.maintenanceScheduleModal?.classList.add('is-hidden');
  },

  errorMessage(message: string = '', action: string = '') {
    switch (action) {
      case 'nav.login':
      case 'auth.login':
      case 'auth.logout':
        dom.loginHint!.textContent = message;
        break;

      case 'nav.register':
        dom.regHint!.textContent = message;
        break;

      case 'auth.register':
        dom.regHint!.textContent = message;
        break;

      case 'bike.add.submit':
        dom.addHint!.textContent = message;
        break;

      case 'bike.edit.submit':
        dom.editBikeHint!.textContent = message;
        break;

      case 'log.submit':
        dom.logServiceHint!.textContent = message;
        break;

      case 'schedule.submit':
        dom.scheduleServiceHint!.textContent = message;
        break;

      default:
        break;
    }
  },
};
