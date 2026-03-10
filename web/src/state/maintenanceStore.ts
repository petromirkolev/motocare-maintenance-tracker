import type { Maintenance } from '../types/maintenance';
import type { MaintenanceLog } from '../types/maintenanceLog';
import { getState, updateState, newId } from './stateStorage';
import { bikeStore } from './bikeStore';
import { appState } from '../types/state';
import { checkDueStatus } from '../utils/serviceDueHelper';
import { checkOverdueStatus } from '../utils/serviceOverdueHelper';
import { checkServiceItemsStatus } from '../utils/serviceItemsHelper';
import { markDueTasks, markOverdueTasks } from '../utils/domHelper';
//
export function readMaintenanceLogForm(form: HTMLFormElement) {
  const fd = new FormData(form);

  const date = String(fd.get('doneAt') ?? '').trim();
  const odo = String(fd.get('odo') ?? '').trim();

  if (!date) throw new Error('Date is required');
  if (!odo) throw new Error('Odo is required');

  return { date, odo };
}

export function readMaintenanceScheduleForm(form: HTMLFormElement) {
  const fd = new FormData(form);

  const intervalDays = String(fd.get('intervalDays') ?? '').trim();
  const intervalKm = String(fd.get('intervalKm') ?? '').trim();

  if (!intervalDays) throw new Error('Interval days are required');
  if (!intervalKm) throw new Error('Interval kilometers are required');

  return { intervalDays, intervalKm };
}

export function getMaintenanceTask(
  bikeId: string,
  name: string,
): Maintenance | undefined {
  return getState().maintenance.find(
    (a: any) => a.bikeId === bikeId && a.name === name,
  );
}

export const maintenanceStore = {
  addMaintenanceTask(input: any, bikeId: string) {
    const maintenanceItem = appState.currentMaintenanceItem;

    const selectedBike = bikeStore.getBike(bikeId);
    if (!selectedBike) throw new Error('No bike selected');

    if (!input.date.trim()) throw new Error('Date is required');
    if (!Number.isFinite(Number(input.odo)) || Number(input.odo) < 0) {
      throw new Error('Invalid odometer');
    }

    const currentMaintenanceItem: Maintenance = {
      id: newId(),
      bikeId: selectedBike?.id,
      name: maintenanceItem,
      odo: input.odo,
      date: input.date,
      intervalKm: null,
      intervalDays: null,
    };

    const currentMaintenanceLog: MaintenanceLog = currentMaintenanceItem;

    updateState((prev) => ({
      ...prev,
      maintenance: [currentMaintenanceItem, ...prev.maintenance],
      maintenanceLog: [currentMaintenanceLog, ...prev.maintenanceLog],
    }));
  },

  updateMaintenanceTask(
    id: string,
    patch: Partial<Omit<Maintenance, 'id' | 'bikeId' | 'name'>>,
  ) {
    const current = getState().maintenance.find((m) => m.id === id);
    if (!current) throw new Error('Maintenance task not found');

    const next: Maintenance = {
      ...current,
      ...patch,
    };

    const currentMaintenanceLog: MaintenanceLog = next;

    updateState((prev) => ({
      ...prev,
      maintenance: prev.maintenance.map((m) => (m.id === id ? next : m)),
      maintenanceLog: [currentMaintenanceLog, ...prev.maintenanceLog],
    }));
  },

  updateTaskInfo(bikeId: string) {
    document.querySelectorAll('.mcard').forEach((cardEl) => {
      const card = cardEl as HTMLElement;

      const taskName = card.dataset.name;
      if (!taskName) return;

      const lastVal = card.querySelector<HTMLElement>(
        '[data-field="last"] .metaVal',
      );
      const dueVal = card.querySelector<HTMLElement>(
        '[data-field="due"] .metaVal',
      );

      if (!lastVal || !dueVal) return;

      const task = getMaintenanceTask(bikeId, taskName);

      if (!task) {
        lastVal.textContent = 'Never logged';
        dueVal.textContent = 'Not scheduled yet';
        return;
      }

      if (task.date && task.odo !== null) {
        lastVal.textContent = `On ${task.date} at ${task.odo} km.`;
      } else {
        lastVal.textContent = 'Never logged';
      }

      if (!task.date || task.odo === null) {
        if (task.intervalDays && task.intervalKm) {
          dueVal.textContent = `Every ${task.intervalDays} days or ${task.intervalKm} km.`;
        } else if (task.intervalDays) {
          dueVal.textContent = `Every ${task.intervalDays} days.`;
        } else if (task.intervalKm) {
          dueVal.textContent = `Every ${task.intervalKm} km.`;
        } else {
          dueVal.textContent = 'Not done yet';
        }
        return;
      }

      const dueParts: string[] = [];

      if (task.intervalDays) {
        const nextDate = new Date(task.date);
        nextDate.setDate(nextDate.getDate() + Number(task.intervalDays));
        dueParts.push(`On ${nextDate.toISOString().slice(0, 10)}`);
      }

      if (task.intervalKm) {
        dueParts.push(`at ${Number(task.intervalKm) + Number(task.odo)} km`);
      }

      dueVal.textContent =
        dueParts.length > 0 ? dueParts.join(' or ') + '.' : 'Not done yet';
    });
  },

  updateOverallProgress(dom: any) {
    const items = getState();

    const selectedBike = appState.selectedBikeId;
    if (!selectedBike) return;

    const today = new Date().toISOString().slice(0, 10);
    const lastServicedItem = items.maintenanceLog.find(
      (item) => item.bikeId === selectedBike,
    );

    const totalServiceItems = items.maintenance.filter((item) =>
      checkServiceItemsStatus(item, selectedBike),
    );

    const totalDueItems = items.maintenance.filter((item) =>
      checkDueStatus(item, selectedBike, today),
    );

    const totalOverdueItems = items.maintenance.filter((item) =>
      checkOverdueStatus(item, selectedBike, today),
    );

    // Update "Recent History"
    if (lastServicedItem !== undefined) {
      dom.maintenanceHistory.querySelector('.empty__title').textContent =
        lastServicedItem.name
          ?.split('-')
          .map((a) => a.toUpperCase())
          .join(' ');
      dom.maintenanceHistory.querySelector('.empty__sub').textContent =
        `Done on ${lastServicedItem.date} @ ${lastServicedItem.odo} km.`;
    } else {
      dom.maintenanceHistory.querySelector('.empty__title').textContent =
        'No service history yet';
      dom.maintenanceHistory.querySelector('.empty__sub').textContent =
        'Log a service to start building your maintenance timeline.';
    }

    // Update Overdue / Due Soon / On Track
    dom.maintenanceOnTrack.textContent =
      totalServiceItems.length - totalOverdueItems.length;
    dom.maintenanceDueSoon.textContent = totalDueItems.length;
    dom.maintenanceOverdue.textContent = totalOverdueItems.length;

    // Mark overdue tasks
    markOverdueTasks(totalOverdueItems);
    markDueTasks(totalDueItems);
  },

  scheduleTask(
    bikeId: string,
    currentTask: string,
    patch: Partial<
      Omit<Maintenance, 'id' | 'bikeId' | 'name' | 'odo' | 'date'>
    >,
  ) {
    const current = getState().maintenance.find((item) => {
      return item.bikeId === bikeId && item.name === currentTask;
    });

    if (!current) {
      const created: Maintenance = {
        id: newId(),
        bikeId,
        name: currentTask,
        date: null,
        odo: null,
        intervalKm: patch.intervalKm ?? null,
        intervalDays: patch.intervalDays ?? null,
      };

      updateState((prev) => ({
        ...prev,
        maintenance: [created, ...prev.maintenance],
      }));

      return created;
    }

    const next: Maintenance = {
      ...current,
      ...patch,
    };

    updateState((prev) => ({
      ...prev,
      maintenance: prev.maintenance.map((item) =>
        item.id === current.id ? next : item,
      ),
    }));

    return next;
  },

  // scheduleTask(
  //   id: string,
  //   currentTask: string,
  //   patch: Partial<
  //     Omit<Maintenance, 'id' | 'bikeId' | 'name' | 'odo' | 'date'>
  //   >,
  // ) {
  //   const current = getState().maintenance.find((log) => {
  //     return log.bikeId === id && log.name === currentTask;
  //   });

  //   if (!current) throw new Error('Maintenance task not found');

  //   const next: Maintenance = {
  //     ...current,
  //     ...patch,
  //   };

  //   updateState((prev) => ({
  //     ...prev,
  //     maintenance: prev.maintenance.map((m) =>
  //       m.id === current.id ? next : m,
  //     ),
  //   }));
  // },
};
