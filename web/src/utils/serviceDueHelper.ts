import { bikeStore } from '../state/bikeStore';

export function checkDueStatus(item: any, selectedBike: string, today: string) {
  if (item.bikeId !== selectedBike) return;
  if (!item.date) return;

  const bike = bikeStore.getBike(selectedBike);
  if (!bike) return;

  let isDueSoonByDate = false;
  let isDueSoonByKm = false;
  let isOverdueByDate = false;
  let isOverdueByKm = false;

  if (item.intervalDays) {
    const intervalDays = Number(item.intervalDays);

    const nextDate = new Date(item.date);
    nextDate.setDate(nextDate.getDate() + intervalDays);

    const currentDate = new Date(today);
    const dueDays = (nextDate.getTime() - currentDate.getTime()) / 86400000;

    isOverdueByDate = dueDays < 0;

    isDueSoonByDate = dueDays >= 0 && dueDays <= 30 && dueDays < intervalDays;
  }

  if (item.intervalKm) {
    const intervalKm = Number(item.intervalKm);
    const dueKm = Number(item.odo) + intervalKm;
    const kmRemaining = dueKm - Number(bike.odo);

    isOverdueByKm = kmRemaining < 0;

    isDueSoonByKm =
      kmRemaining >= 0 && kmRemaining <= 500 && kmRemaining < intervalKm;
  }

  if (isOverdueByDate || isOverdueByKm) return;
  if (isDueSoonByDate || isDueSoonByKm) return item;
}
