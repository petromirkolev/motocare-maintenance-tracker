export function req<T extends HTMLElement>(el: T | null, name: string): T {
  if (!el) throw new Error(`Missing DOM element: ${name}`);
  return el;
}

export function markOverdueTasks(item: any) {
  document.querySelectorAll('.mcard').forEach((cardEl) => {
    const card = cardEl as HTMLElement;
    card
      .querySelector<HTMLElement>('.mcard__top .mcard__title')
      ?.classList.remove('is-overdue');

    item.forEach((item: any) => {
      if (item.name === card.dataset.name) {
        card
          .querySelector<HTMLElement>('.mcard__top .mcard__title')
          ?.classList.add('is-overdue');
      }
    });
  });
}
