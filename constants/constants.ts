export const API_URL = 'http://127.0.0.1:3001';

export const msg = {
  ERR_INTERNAL: 'Internal Server Error',

  USER_REG_OK: 'Registration successful',
  USER_REG_ERR: 'Registration failed',
  USER_LOG_OK: 'Login successful',
  USER_LOG_ERR: 'Login failed',
  USER_NOT_LOGGED: 'No logged-in user',
  USER_EXISTS: 'User already exists',

  EMAIL_INVALID: 'Invalid email format',
  EMAIL_REQ: 'Email is required',
  EMAIL_PASS_REQ: 'Email and password are required',

  PASS_REQ: 'Password is required',
  PASS_CONF_REQ: 'Confirm password is required',
  PASS_SHORT: 'Password must be at least 8 characters',
  PASS_LONG: 'Password must be at most 32 characters',
  PASS_NO_MATCH: 'Passwords do not match',

  CRED_INVALID: 'Invalid credentials',

  BIKE_FETCH_ERR: 'Failed to fetch bikes',
  BIKE_CREATE_ERR: 'Failed to create bike',
  BIKE_UPDATE_ERR: 'Failed to update bike',
  BIKE_DELETE_ERR: 'Failed to delete bike',

  BIKE_CREATE_OK: 'Bike created successfully',
  BIKE_UPDATE_OK: 'Bike updated successfully',
  BIKE_DELETE_OK: 'Bike deleted successfully',

  BIKE_NOT_FOUND: 'Bike not found',
  BIKE_ID_REQ: 'Missing bike_id',
  BIKE_NOT_SEL: 'No bike selected',

  BIKE_MAKE_REQ: 'Make is required',
  BIKE_MODEL_REQ: 'Model is required',
  BIKE_YEAR_REQ: 'Year is required',
  BIKE_ODO_REQ: 'Odometer is required',

  BIKE_ODO_NUM: 'Odometer must be a number',
  BIKE_ODO_POS: 'odo must be a positive integer',
  BIKE_ODO_DECR: 'Odometer cannot decrease',

  BIKE_YEAR_NUM: 'Year must be a number',
  BIKE_YEAR_RANGE: 'Year must be an integer between 1900 and 2100',

  MAINT_NOT_SEL: 'No maintenance item selected',
  MAINT_CREATE_OK: 'Maintenance created successfully',
  MAINT_SCHED_OK: 'Maintenance scheduled successfully',

  MAINT_DAYS_REQ: 'interval_days are required',
  MAINT_KM_REQ: 'interval_km is required',
  MAINT_DAYS_POS: 'interval_days must be a positive integer',
  MAINT_KM_POS: 'interval_km must be a positive integer',

  MAINT_FETCH_ERR: 'Failed to fetch maintenance',
  MAINT_UPSERT_ERR: 'Failed to upsert maintenance',
  MAINT_LOGS_ERR: 'Failed to fetch maintenance logs',
  MAINT_LOG_CREATE_ERR: 'Failed to create maintenance log',

  DATE_REQ: 'Date is required',

  ADD_FORM_MISS: 'Missing add bike form',
  EDIT_FORM_MISS: 'Missing edit bike form',
  EDIT_INPUTS_MISS: 'Edit form inputs missing from DOM',
};
