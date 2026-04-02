export type Bike = {
  make?: string;
  model?: string;
  year?: number;
  odo?: number;
};

export type BikeResponse = {
  id: string;
  user_id: string;
  make: string;
  model: string;
  year: number;
  odo: number;
};
