import type { Bike } from '../types/bikes';

export function createBikeCard(bike: Bike): HTMLElement {
  const id = String(bike.id);

  const article = document.createElement('article');
  article.className = 'bikeCard';
  article.dataset.bikeId = id;
  article.setAttribute('data-testid', `bike-card-${id}`);

  article.innerHTML = `
    <button class="bikeCard__main" type="button" data-bike-id="${id}" data-action="bike.open" data-testid="bike-open-${id}">
      <div class="bikeCard__name" data-testid="bike-name-${id}"></div>
      <div class="bikeCard__meta" data-testid="bike-meta-${id}"></div>
      <div class="bikeCard__odo">
        <span class="bikeCard__odoVal" data-testid="bike-odo-${id}"></span>
        <span class="bikeCard__odoUnit">km</span>
      </div>
    </button>

    <div class="bikeCard__actions">
      <button class="iconbtn iconbtn--edit" type="button" data-bike-id="${id}" data-action="bike.edit.open" data-testid="bike-edit-${id}" aria-label="Edit bike">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
          <path d="M12 20h9" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path>
        </svg>
      </button>

      <button class="iconbtn iconbtn--danger" type="button" data-action="bike.delete" data-bike-id="${id}" data-testid="bike-delete-${id}" aria-label="Delete bike">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
          <path d="M3 6h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
          <path d="M8 6V4h8v2" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path>
          <path d="M6 6l1 16h10l1-16" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path>
        </svg>
      </button>
    </div>
  `;

  const nameEl = article.querySelector(`[data-testid="bike-name-${id}"]`);
  const metaEl = article.querySelector(`[data-testid="bike-meta-${id}"]`);
  const odoEl = article.querySelector(`[data-testid="bike-odo-${id}"]`);

  if (!nameEl || !metaEl || !odoEl) {
    throw new Error('Bike card template missing expected elements');
  }

  nameEl.textContent = bike.make;
  metaEl.textContent = `${bike.year} ${bike.make} ${bike.model}`;
  odoEl.textContent = String(bike.odo);

  return article;
}
