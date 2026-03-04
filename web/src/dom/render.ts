import { dom } from './selectors';
import { bikeStore } from '../state/bikeStore';
import { createBikeCard } from '../ui/createBikeCard';
import { showScreen } from '../ui/showScreen';

export const render = {
  initialScreen(): void {
    showScreen('login');
  },

  registerScreen(): void {
    showScreen('register');
  },

  garageScreen(): void {
    (dom.bikeGrid as HTMLDivElement).innerHTML = '';

    showScreen('garage');

    dom.userEmail!.innerHTML = `Hello, Petro!`;

    const bikes = bikeStore.getBikes();

    if (bikes.length >= 0) {
      (
        document.querySelector('[data-testid="garage-count"]') as HTMLElement
      ).textContent = `${bikes.length} motorcycles`;
      document
        .querySelector('[data-testid="garage-empty"]')
        ?.classList.remove('is-hidden');

      bikes.forEach((bike) => dom.bikeGrid?.appendChild(createBikeCard(bike)));
    } else {
      document
        .querySelector('[data-testid="garage-empty"]')
        ?.classList.add('is-hidden');
    }
  },

  addBikeScreen(): void {
    showScreen('bikeAdd');
  },

  editBikeScreen(): void {
    showScreen('bikeEdit');
  },
};
