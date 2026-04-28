import { dom } from './selectors';
import { getState, getCurrentUser } from '../state/index';
import { createBikeCard, showScreen } from '../ui/index';
import { request } from '../utils/dom-helper';

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

    const grid = request(dom.bikeGrid, 'bikeGrid');

    grid.innerHTML = '';

    const state = getState();
    const bikes = state.bikes;
    const currentUser = getCurrentUser();

    request(dom.userEmail, 'userEmail').textContent =
      `Hello, ${currentUser?.email}`;
    request(dom.garageCount, 'garageCount').textContent =
      bikes.length > 1 || bikes.length === 0
        ? `${bikes.length} motorcycles`
        : `${bikes.length} motorcycle`;

    bikes.forEach((bike) => grid.appendChild(createBikeCard(bike)));

    bikes.length > 0
      ? request(dom.garageEmpty, 'garageEmpty').classList.add('is-hidden')
      : request(dom.garageEmpty, 'garageEmpty').classList.remove('is-hidden');
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
        if (dom.loginHint) dom.loginHint.textContent = message;
        break;

      case 'nav.register':
        if (dom.regHint) dom.regHint.textContent = message;
        break;

      case 'auth.register':
        if (dom.regHint) dom.regHint.textContent = message;
        break;

      case 'bike.add.submit':
        if (dom.addHint) dom.addHint.textContent = message;
        break;

      case 'bike.edit.submit':
        if (dom.editBikeHint) dom.editBikeHint.textContent = message;
        break;

      case 'log.submit':
        if (dom.logServiceHint) dom.logServiceHint.textContent = message;
        break;

      case 'schedule.submit':
        if (dom.scheduleServiceHint)
          dom.scheduleServiceHint.textContent = message;
        break;

      default:
        break;
    }
  },
};
