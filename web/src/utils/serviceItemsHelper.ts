import type { Maintenance } from '../types/maintenance';

export function checkServiceItemsStatus(item: Maintenance, selectedBike: any) {
  if (item.date !== null && item.odo !== null && item.bikeId === selectedBike)
    return item;
}
