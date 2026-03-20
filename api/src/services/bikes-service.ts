import { v4 as uuidv4 } from 'uuid';
import { getAll, getOne, runQuery } from '../db-helpers';
import { BikeRow } from '../types/bike';

export async function createBike(params: {
  user_id: string;
  make: string;
  model: string;
  year: number;
  odo: number;
}): Promise<string> {
  const id = uuidv4();
  await runQuery(
    `
      INSERT INTO bikes (id, user_id, make, model, year, odo, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      params.user_id,
      params.make,
      params.model,
      params.year,
      params.odo,
      new Date().toISOString(),
    ],
  );
  return id;
}

export async function findBikeById(id: string): Promise<BikeRow | undefined> {
  return getOne<BikeRow>('SELECT * FROM bikes WHERE id = ?', [id]);
}

export async function listBikesByUserId(user_id: string): Promise<BikeRow[]> {
  return getAll<BikeRow>(
    'SELECT * FROM bikes WHERE user_id = ? ORDER BY created_at DESC',
    [user_id],
  );
}

export async function updateBike(params: {
  id: string;
  user_id: string;
  make: string;
  model: string;
  year: number;
  odo: number;
}): Promise<void> {
  await runQuery(
    `
      UPDATE bikes
      SET make = ?, model = ?, year = ?, odo = ?
      WHERE id = ? AND user_id = ?
    `,
    [
      params.make,
      params.model,
      params.year,
      params.odo,
      params.id,
      params.user_id,
    ],
  );
}

export async function deleteBike(params: {
  id: string;
  user_id: string;
}): Promise<void> {
  await runQuery(
    `
      DELETE FROM bikes
      WHERE id = ? AND user_id = ?
    `,
    [params.id, params.user_id],
  );
}
