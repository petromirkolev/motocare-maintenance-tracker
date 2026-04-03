import { render } from '../dom/render';
import { dom } from '../dom/selectors';
import { req } from '../utils/dom-helper';
import { bikeStore, readBikeForm } from '../state/bike-store';
import { createBikeApi, updateBikeApi, deleteBikeApi } from '../api/bikes';
import { appState } from '../types/state';
import { initState, resetState } from '../state/state-store';
import { maintenanceStore } from '../state/maintenance-store';
import { logMaintenanceApi, scheduleMaintenanceApi } from '../api/maintenance';
import { loginUser, registerUser } from '../api/auth';
import { createMaintenanceLogApi } from '../api/maintenance-logs';
import {
  refreshMaintenance,
  refreshBikes,
  refreshMaintenanceLogs,
} from '../state/state-store';
import {
  readLoginForm,
  readRegForm,
  setCurrentUser,
} from '../state/auth-store';
import { msg } from '../../../constants/constants';

type Action =
  | 'auth.login'
  | 'auth.logout'
  | 'auth.register'
  | 'nav.login'
  | 'nav.register'
  | 'nav.garage'
  | 'nav.bikeAdd'
  | 'bike.open'
  | 'bike.edit.open'
  | 'bike.delete'
  | 'bike.add.submit'
  | 'bike.edit.submit'
  | 'log.service'
  | 'schedule.service'
  | 'modal.close'
  | 'schedule.submit'
  | 'log.submit';

function bindEvents(): void {
  document.addEventListener('click', async (e: MouseEvent) => {
    const target = e.target as HTMLElement;

    const el = target.closest<HTMLElement>('[data-action]');
    if (!el) return;

    const action = el.dataset.action as Action;
    if (!action) return;

    switch (action) {
      case 'nav.login':
        const forms = document.querySelectorAll('form');

        forms.forEach((form) => {
          (form as HTMLFormElement).reset();
        });
        render.initialScreen();
        break;

      case 'auth.login': {
        try {
          const loginForm = dom.loginForm as HTMLFormElement;
          const input = readLoginForm(loginForm);
          const response = await loginUser(input.email, input.password);

          setCurrentUser(response.user);
          resetState();
          await initState();

          loginForm?.reset();
          render.errorMessage(msg.USER_LOG_OK, 'auth.login');
          setTimeout(() => {
            render.garageScreen();
          }, 1000);
        } catch (error) {
          error instanceof Error
            ? render.errorMessage(error.message, action)
            : render.errorMessage(msg.ERR_INTERNAL, action);
        }
        break;
      }

      case 'nav.register':
        const loginForm = dom.loginForm as HTMLFormElement;
        loginForm?.reset();
        render.registerScreen();
        break;

      case 'auth.register': {
        try {
          const regForm = dom.regForm as HTMLFormElement;
          const input = readRegForm(regForm);
          await registerUser(input.email.toLowerCase(), input.password);
          render.errorMessage(msg.USER_REG_OK, 'auth.register');
          regForm?.reset();
          setTimeout(() => {
            render.initialScreen();
          }, 1500);
        } catch (error) {
          error instanceof Error
            ? render.errorMessage(error.message, action)
            : render.errorMessage(msg.ERR_INTERNAL, action);
        }
        break;
      }

      case 'auth.logout':
        setCurrentUser(null);
        await resetState();
        render.errorMessage('', action);
        render.initialScreen();
        break;

      case 'nav.garage':
        render.errorMessage('', 'bike.add.submit');
        if (dom.addBikeForm) dom.addBikeForm.reset();
        render.garageScreen();
        break;

      case 'nav.bikeAdd':
        render.addBikeScreen();
        break;

      case 'bike.add.submit': {
        const addBikeForm = (dom.addBikeForm as HTMLFormElement) || null;
        if (!addBikeForm) throw new Error(msg.ADD_FORM_MISS);

        try {
          const input = readBikeForm(addBikeForm);

          await createBikeApi({
            make: input.make,
            model: input.model,
            year: Number(input.year),
            odo: Number(input.odo),
          });

          await refreshBikes();
          addBikeForm.reset();
          render.garageScreen();
        } catch (error) {
          error instanceof Error
            ? render.errorMessage(error.message, action)
            : render.errorMessage(msg.ERR_INTERNAL, action);
        }
        break;
      }

      case 'bike.delete':
        try {
          const el = target.closest<HTMLElement>('[data-action]');
          const id = el?.dataset.bikeId;

          if (!id) break;

          await deleteBikeApi(id);
          await refreshBikes();
          render.garageScreen();
        } catch (error) {
          console.error(error);
        }
        break;

      case 'bike.edit.open':
        render.editBikeScreen();

        appState.selectedBikeId =
          target.closest<HTMLElement>('[data-action]')?.dataset.bikeId || null;
        if (!appState.selectedBikeId) break;

        const selectedBike = bikeStore.getBike(appState.selectedBikeId);
        if (!selectedBike) break;

        const editMake = dom.editBikeMake;
        const editYear = dom.editBikeYear;
        const editModel = dom.editBikeModel;
        const editOdo = dom.editBikeOdo;
        const editId = dom.editBikeId;

        if (!editMake || !editYear || !editModel || !editOdo || !editId) {
          throw new Error(msg.EDIT_INPUTS_MISS);
        }

        editId.value = appState.selectedBikeId;
        editMake.value = selectedBike.make;
        editYear.value = String(selectedBike.year);
        editModel.value = selectedBike.model;
        editOdo.value = String(selectedBike.odo);

        break;

      case 'bike.edit.submit': {
        const bikeEditForm = dom.editBikeForm as HTMLFormElement | null;
        if (!bikeEditForm) throw new Error(msg.EDIT_FORM_MISS);

        const idInput = dom.editBikeId as HTMLInputElement | null;
        const id = idInput?.value?.trim();
        if (!id) throw new Error(msg.BIKE_ID_REQ);

        try {
          const form = readBikeForm(bikeEditForm);

          await updateBikeApi({
            id,
            make: form.make,
            model: form.model,
            year: Number(form.year),
            odo: Number(form.odo),
          });

          await refreshBikes();
          bikeEditForm.reset();
          render.errorMessage('', action);
          render.garageScreen();
        } catch (error) {
          error instanceof Error
            ? render.errorMessage(error.message, action)
            : render.errorMessage(msg.ERR_INTERNAL, action);
        }
        break;
      }

      case 'bike.open': {
        render.maintenanceScreen();

        appState.selectedBikeId =
          target.closest<HTMLElement>('[data-action]')?.dataset.bikeId || null;
        if (!appState.selectedBikeId) break;

        req(dom.maintenanceEditBtn, 'maintenanceEditBtn').dataset.bikeId =
          appState.selectedBikeId;
        req(dom.maintenanceDeleteBtn, 'maintenanceDeleteBtn').dataset.bikeId =
          appState.selectedBikeId;
        req(dom.bikeScreen, 'bikeScreen').dataset.bikeId =
          appState.selectedBikeId;

        const selectedBike = bikeStore.getBike(appState.selectedBikeId);
        if (!selectedBike) break;

        (dom.maintenanceBikeName as HTMLElement).innerHTML = selectedBike.make;
        (dom.maintenanceBikeModel as HTMLElement).innerHTML =
          selectedBike.model;
        (dom.maintenanceBikeOdo as HTMLElement).innerHTML = String(
          selectedBike.odo,
        );

        await refreshMaintenance(appState.selectedBikeId);
        await refreshMaintenanceLogs(appState.selectedBikeId);

        maintenanceStore.updateTaskInfo(appState.selectedBikeId);
        maintenanceStore.updateOverallProgress(dom);
        break;
      }

      case 'log.service': {
        const maintenanceItem =
          target.closest<HTMLElement>('[data-action]')?.parentElement
            ?.parentElement?.dataset.name;

        if (!maintenanceItem) break;
        appState.currentMaintenanceItem = maintenanceItem;

        render.openServiceModal('log.service');
        break;
      }

      case 'log.submit': {
        const maintenanceForm = (dom.logServiceForm as HTMLFormElement) || null;

        try {
          const input =
            maintenanceStore.readMaintenanceLogForm(maintenanceForm);

          const bike_id = appState.selectedBikeId;
          if (!bike_id) throw new Error(msg.BIKE_NOT_SEL);

          const currentTask = appState.currentMaintenanceItem;
          if (!currentTask) throw new Error(msg.MAINT_NOT_SEL);

          const existingTask = maintenanceStore.getMaintenanceTask(
            bike_id,
            currentTask,
          );

          if (
            input.date === '' ||
            input.date === null ||
            input.date === undefined
          )
            throw new Error(msg.DATE_REQ);

          if (Number(input.odo) < 0) throw new Error(msg.BIKE_ODO_POS);

          await logMaintenanceApi({
            bike_id,
            name: currentTask,
            date: input.date,
            odo: input.odo !== null ? Number(input.odo) : null,
            interval_km: existingTask?.interval_km ?? null,
            interval_days: existingTask?.interval_days ?? null,
          });

          await createMaintenanceLogApi({
            bike_id,
            name: currentTask,
            date: input.date,
            odo: Number(input.odo),
          });

          await refreshMaintenance(bike_id);
          await refreshMaintenanceLogs(bike_id);

          maintenanceStore.updateTaskInfo(bike_id);
          maintenanceStore.updateOverallProgress(dom);
          maintenanceForm.reset();
          render.closeServiceModal();
        } catch (error) {
          error instanceof Error
            ? render.errorMessage(error.message, action)
            : render.errorMessage(msg.ERR_INTERNAL, action);
        }
        break;
      }

      case 'schedule.service': {
        const maintenanceItem =
          target.closest<HTMLElement>('[data-action]')?.parentElement
            ?.parentElement?.dataset.name;
        if (!maintenanceItem) break;
        appState.currentMaintenanceItem = maintenanceItem;
        render.openServiceModal('schedule.service');
        break;
      }

      case 'schedule.submit': {
        const scheduleForm =
          (dom.scheduleServiceForm as HTMLFormElement) || null;

        try {
          const input =
            maintenanceStore.readMaintenanceScheduleForm(scheduleForm);

          if (Number(input.interval_days) <= 0)
            throw new Error(msg.MAINT_DAYS_POS);

          if (Number(input.interval_km) <= 0) throw new Error(msg.MAINT_KM_POS);

          const bike_id = appState.selectedBikeId;
          if (!bike_id) throw new Error(msg.BIKE_NOT_SEL);

          const currentTask = appState.currentMaintenanceItem;
          if (!currentTask) throw new Error(msg.MAINT_NOT_SEL);

          await scheduleMaintenanceApi({
            bike_id,
            name: currentTask,
            date: null,
            odo: null,
            interval_km:
              input.interval_km !== null ? Number(input.interval_km) : null,
            interval_days:
              input.interval_days !== null ? Number(input.interval_days) : null,
          });

          await refreshMaintenance(bike_id);

          maintenanceStore.updateTaskInfo(bike_id);
          maintenanceStore.updateOverallProgress(dom);
          render.closeServiceModal();
          scheduleForm.reset();
        } catch (error) {
          error instanceof Error
            ? render.errorMessage(error.message, action)
            : render.errorMessage(msg.ERR_INTERNAL, action);
        }
        break;
      }

      case 'modal.close': {
        render.closeServiceModal();
        break;
      }
    }
  });
}

export { bindEvents };
