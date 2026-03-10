export function checkDueStatus(item: any) {
  if (!item.intervalDays || !item.date) return;

  const nextDate: any = new Date(item.date);
  nextDate.setDate(nextDate.getDate() + Number(item.intervalDays));
  const currentDate: any = new Date(item.date);
  const dueDays = (nextDate - currentDate) / 86400000;
  const dueKm = Number(item.odo) + Number(item.intervalKm);

  if (dueDays < 30) return item;
}
