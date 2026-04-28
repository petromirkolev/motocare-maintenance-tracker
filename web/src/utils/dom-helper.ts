import type { Maintenance } from '../types/maintenance';

export function request<T extends HTMLElement>(el: T | null, name: string): T {
  if (!el) throw new Error(`Missing DOM element: ${name}`);
  return el;
}

export function markOverdueTasks(item: Maintenance[]) {
  document.querySelectorAll('.mcard').forEach((cardEl) => {
    const card = cardEl as HTMLElement;
    card
      .querySelector<HTMLElement>('.mcard__top .mcard__title')
      ?.classList.remove('is-overdue');

    item.forEach((item) => {
      if (item.name === card.dataset.name) {
        card
          .querySelector<HTMLElement>('.mcard__top .mcard__title')
          ?.classList.add('is-overdue');
      }
    });
  });
}

export function markDueTasks(item: Maintenance[]) {
  document.querySelectorAll('.mcard').forEach((cardEl) => {
    const card = cardEl as HTMLElement;
    card
      .querySelector<HTMLElement>('.mcard__top .mcard__title')
      ?.classList.remove('is-due');

    item.forEach((item: Maintenance) => {
      if (item.name === card.dataset.name) {
        card
          .querySelector<HTMLElement>('.mcard__top .mcard__title')
          ?.classList.add('is-due');
      }
    });
  });
}
