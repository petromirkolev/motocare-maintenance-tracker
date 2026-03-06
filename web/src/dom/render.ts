import { dom } from './selectors';
import { bikeStore } from '../state/bikeStore';
import { createBikeCard } from '../ui/createBikeCard';
import { showScreen } from '../ui/showScreen';
import { req } from '../utils/domHelper';

export const render = {
  initialScreen(): void {
    showScreen('login');
  },

  registerScreen(): void {
    showScreen('register');
  },

  garageScreen(): void {
    (dom.bikeGrid as HTMLDivElement).innerHTML = '';
    const bikes = bikeStore.getBikes();

    req(dom.userEmail, 'userEmail').textContent = 'Hello, {user}!';
    req(dom.garageCount, 'garageCount').textContent =
      `${bikes.length} motorcycles`;

    showScreen('garage');

    if (bikes.length > 0) {
      req(dom.garageEmpty, 'garageEmpty').classList.add('is-hidden');

      bikes.forEach((bike) => dom.bikeGrid?.appendChild(createBikeCard(bike)));
    } else {
      req(dom.garageEmpty, 'garageEmpty').classList.remove('is-hidden');
    }
  },

  addBikeScreen(): void {
    showScreen('bikeAdd');
  },

  editBikeScreen(): void {
    showScreen('bikeEdit');
  },
};
