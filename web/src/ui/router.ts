import { render } from '../dom/render';
import { dom } from '../dom/selectors';
import { bikeStore, readBikeForm } from '../state/bikeStore';

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
        const DELETE_ID =
          target.closest<HTMLElement>('[data-action]')?.dataset.bikeId;
        bikeStore.deleteBike(DELETE_ID!);
        render.garageScreen();
        break;

      case 'bike.edit.open':
        render.editBikeScreen();

        const id = target.closest<HTMLElement>('[data-action]')?.dataset.bikeId;
        if (!id) break;

        const foundBike = bikeStore.getBike(id);
        if (!foundBike) break;

        const editMake = dom.editMake;
        const editYear = dom.editYear;
        const editModel = dom.editModel;
        const editOdo = dom.editOdo;
        const editId = dom.editBikeId;

        if (!editMake || !editYear || !editModel || !editOdo || !editId) {
          throw new Error('Edit form inputs missing from DOM');
        }

        editId.value = id;

        editMake.value = foundBike.make;
        editYear.value = String(foundBike.year);
        editModel.value = foundBike.model;
        editOdo.value = String(foundBike.odo);

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
    }
  });
}

export { bindEvents };
