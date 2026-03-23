import { fetchBikes } from '../api/bikes';
import { fetchMaintenanceByBikeId } from '../api/maintenance';
import { fetchMaintenanceLogsByBikeId } from '../api/maintenance-logs';
import type { StoreState } from '../types/state';

const listeners = new Set<() => void>();

let state: StoreState = {
  bikes: [],
  maintenance: [],
  maintenanceLog: [],
};

async function initState(): Promise<void> {
  state = await loadState();
  notify();
}

async function loadState(): Promise<StoreState> {
  try {
    const bikes = await fetchBikes();

    return {
      bikes: Array.isArray(bikes) ? bikes : [],
      maintenance: [],
      maintenanceLog: [],
    };
  } catch {
    return {
      bikes: [],
      maintenance: [],
      maintenanceLog: [],
    };
  }
}

function resetState(): void {
  state.bikes = [];
  state.maintenance = [];
  state.maintenanceLog = [];
}

function getState(): StoreState {
  return state;
}

function setState(nextState: StoreState): void {
  state = nextState;
  notify();
}

function updateState(updater: (prev: StoreState) => StoreState): void {
  state = updater(state);
  notify();
}

async function refreshBikes(): Promise<void> {
  const bikes = await fetchBikes();

  state = {
    ...state,
    bikes: Array.isArray(bikes) ? bikes : [],
  };

  notify();
}

async function refreshMaintenance(bikeId: string): Promise<void> {
  const maintenance = await fetchMaintenanceByBikeId(bikeId);

  state = {
    ...state,
    maintenance: Array.isArray(maintenance) ? maintenance : [],
  };

  notify();
}

async function refreshMaintenanceLogs(bikeId: string): Promise<void> {
  const maintenanceLog = await fetchMaintenanceLogsByBikeId(bikeId);

  state = {
    ...state,
    maintenanceLog: Array.isArray(maintenanceLog) ? maintenanceLog : [],
  };

  notify();
}

function notify() {
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export {
  initState,
  loadState,
  resetState,
  notify,
  subscribe,
  setState,
  getState,
  updateState,
  refreshBikes,
  refreshMaintenance,
  refreshMaintenanceLogs,
};
