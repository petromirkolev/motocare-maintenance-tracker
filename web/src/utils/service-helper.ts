import type { Maintenance } from '../types/maintenance';
import type { MaintenanceLog } from '../types/maintenance-log';

type ServiceStatus = {
  isOverdue: boolean;
  isDueSoon: boolean;
};

type ServiceStatusItem = {
  schedule: Maintenance;
  latestLog?: MaintenanceLog;
  status: ServiceStatus;
};

export function getLatestLogForTask(
  logs: MaintenanceLog[],
  selectedBike: string,
  taskName: string,
): MaintenanceLog | undefined {
  const matchingLogs = logs
    .filter(
      (log) =>
        log.bike_id === selectedBike &&
        log.name === taskName &&
        log.date !== null &&
        log.odo !== null,
    )
    .sort((a, b) => {
      const aDate = a.date ? new Date(a.date).getTime() : 0;
      const bDate = b.date ? new Date(b.date).getTime() : 0;

      if (bDate !== aDate) return bDate - aDate;
      return Number(b.odo ?? 0) - Number(a.odo ?? 0);
    });

  return matchingLogs[0];
}

export function getLatestLogForBike(
  logs: MaintenanceLog[],
  selectedBike: string,
): MaintenanceLog | undefined {
  return logs
    .filter(
      (log) =>
        log.bike_id === selectedBike && log.date !== null && log.odo !== null,
    )
    .sort((a, b) => {
      const aDate = a.date ? new Date(a.date).getTime() : 0;
      const bDate = b.date ? new Date(b.date).getTime() : 0;

      if (bDate !== aDate) return bDate - aDate;
      return Number(b.odo ?? 0) - Number(a.odo ?? 0);
    })[0];
}

export function calculateTaskStatus(
  schedule: Maintenance,
  latestLog: MaintenanceLog | undefined,
  currentBikeOdo: number,
  today: string,
): ServiceStatus {
  if (!latestLog || !latestLog.date || latestLog.odo === null) {
    return {
      isOverdue: true,
      isDueSoon: false,
    };
  }

  const todayMs = new Date(today).getTime();
  const lastDoneMs = new Date(latestLog.date).getTime();
  const lastDoneOdo = Number(latestLog.odo);

  const intervalDays = Number(schedule.interval_days ?? 0);
  const intervalKm = Number(schedule.interval_km ?? 0);

  const nextDueDateMs =
    intervalDays > 0 ? lastDoneMs + intervalDays * 24 * 60 * 60 * 1000 : null;

  const nextDueOdo = intervalKm > 0 ? lastDoneOdo + intervalKm : null;

  const overdueByDate = nextDueDateMs !== null && todayMs > nextDueDateMs;
  const overdueByKm = nextDueOdo !== null && currentBikeOdo > nextDueOdo;

  const isOverdue = overdueByDate || overdueByKm;

  const dueSoonDaysThreshold = 30;
  const dueSoonKmThreshold = 500;

  const daysRemaining =
    nextDueDateMs !== null
      ? Math.ceil((nextDueDateMs - todayMs) / (24 * 60 * 60 * 1000))
      : null;

  const kmRemaining =
    nextDueOdo !== null ? Number(nextDueOdo) - currentBikeOdo : null;

  const dueSoonByDate =
    daysRemaining !== null &&
    daysRemaining >= 0 &&
    daysRemaining <= dueSoonDaysThreshold;

  const dueSoonByKm =
    kmRemaining !== null &&
    kmRemaining >= 0 &&
    kmRemaining <= dueSoonKmThreshold;

  const isDueSoon = !isOverdue && (dueSoonByDate || dueSoonByKm);

  return { isOverdue, isDueSoon };
}

export function getServiceStatusesForBike(
  schedules: Maintenance[],
  logs: MaintenanceLog[],
  selectedBike: string,
  currentBikeOdo: number,
  today: string,
): ServiceStatusItem[] {
  const uniqueSchedules = Array.from(
    new Map(
      schedules
        .filter((item) => item.bike_id === selectedBike)
        .map((item) => [item.name, item]),
    ).values(),
  );

  return uniqueSchedules.map((schedule) => {
    const latestLog = getLatestLogForTask(logs, selectedBike, schedule.name);

    return {
      schedule,
      latestLog,
      status: calculateTaskStatus(schedule, latestLog, currentBikeOdo, today),
    };
  });
}
