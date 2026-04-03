export type ValidBikeInput = {
  make: string;
  model: string;
  year: number;
  odo: number;
};

export type InvalidBikeInput = {
  yearBelow: number;
  yearAbove: number;
  odo: number;
};

export type BikeResponse = {
  id: string;
  user_id: string;
  make: string;
  model: string;
  year: number;
  odo: number;
};
