import { render } from '../dom/render';
import { dom } from '../dom/selectors';
import { req } from '../utils/domHelper';
import { bikeStore, readBikeForm } from '../state/bikeStore';
import { showScreen } from './showScreen';
import { appState } from '../types/state';

type Action =
  | 'auth.login'
  | 'auth.logout'
  | 'nav.login'
  | 'nav.register'
  | 'nav.garage'
  | 'nav.bikeAdd'
  | 'bike.open'
  | 'bike.edit.open'
  | 'bike.delete'
  | 'bike.add.submit'
  | 'bike.edit.submit';

function bindEvents(): void {
  document.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const el = target.closest<HTMLElement>('[data-action]');

    if (!el) return;

    const action = el.dataset.action as Action | undefined;
    console.log(action);

    if (!action) return;

    switch (action) {
      case 'auth.login':
      case 'nav.garage':
        render.garageScreen();
        break;

      case 'nav.register':
        render.registerScreen();
        break;

      case 'auth.logout':
      case 'nav.login':
        render.initialScreen();
        break;

      case 'nav.bikeAdd':
        render.addBikeScreen();
        break;

      case 'bike.add.submit': {
        const form = (dom.addBikeForm as HTMLFormElement) || null;
        const input = readBikeForm(form);
        bikeStore.addBike(input);
        form.reset();
        render.garageScreen();
        break;
      }

      case 'bike.delete':
        const el = target.closest<HTMLElement>('[data-action]');
        const id = el?.dataset.bikeId;

        if (!id) break;

        bikeStore.deleteBike(id);
        render.garageScreen();
        break;

      case 'bike.edit.open':
        render.editBikeScreen();

        appState.selectedBikeId =
          target.closest<HTMLElement>('[data-action]')?.dataset.bikeId;

        console.log(appState.selectedBikeId);

        if (!appState.selectedBikeId) break;

        appState.selectedBikeFound = bikeStore.getBike(appState.selectedBikeId);
        if (!appState.selectedBikeFound) break;

        const editMake = dom.editMake;
        const editYear = dom.editYear;
        const editModel = dom.editModel;
        const editOdo = dom.editOdo;
        const editId = dom.editBikeId;

        if (!editMake || !editYear || !editModel || !editOdo || !editId) {
          throw new Error('Edit form inputs missing from DOM');
        }

        editId.value = appState.selectedBikeId;

        editMake.value = appState.selectedBikeFound.make;
        editYear.value = String(appState.selectedBikeFound.year);
        editModel.value = appState.selectedBikeFound.model;
        editOdo.value = String(appState.selectedBikeFound.odo);

        break;

      case 'bike.edit.submit': {
        const editForm = dom.editBikeForm as HTMLFormElement | null;
        if (!editForm) throw new Error('Missing edit bike form');

        const idInput = dom.editBikeId as HTMLInputElement | null;
        const id = idInput?.value?.trim();
        if (!id) throw new Error('Missing bike id for edit submit');

        const form = readBikeForm(editForm);
        bikeStore.updateBike(id, form);
        editForm.reset();
        render.garageScreen();
        break;
      }

      case 'bike.open': {
        showScreen('bike');

        appState.selectedBikeId =
          target.closest<HTMLElement>('[data-action]')?.dataset.bikeId;
        if (!appState.selectedBikeId) break;

        req(dom.maintenanceEditBtn, 'maintenanceEditBtn').dataset.bikeId =
          appState.selectedBikeId;
        req(dom.maintenanceDeleteBtn, 'maintenanceEditBtn').dataset.bikeId =
          appState.selectedBikeId;

        appState.selectedBikeFound = bikeStore.getBike(appState.selectedBikeId);
        if (!appState.selectedBikeFound) break;

        (dom.bikeName as HTMLElement).innerHTML =
          appState.selectedBikeFound.make;
        (dom.bikeModel as HTMLElement).innerHTML =
          appState.selectedBikeFound.model;
        (dom.bikeOdo as HTMLElement).innerHTML = String(
          appState.selectedBikeFound.odo,
        );
      }
    }
  });
}

export { bindEvents };
