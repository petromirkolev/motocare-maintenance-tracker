export const msg = {
  // Auth
  REG_SUCCESS: 'Registration successful',
  REG_FAIL: 'Registration failed:',
  LOGIN_SUCCESS: 'Login successful',
  LOGIN_FAIL: 'Login failed:',
  INVALID_CREDENTIALS: 'Invalid credentials',
  INVALID_EMAIL_FORMAT: 'Invalid email format',
  PASS_SHORT: 'Password must be at least 8 characters',
  PASS_LONG: 'Password must be 32 characters at most',
  MISSING_AUTH_FIELDS: 'Email and password are required',
  USER_ALREADY_EXISTS: 'User already exists',

  // Params
  USER_ID_PARAM: 'user_id query param is required',
  BIKE_PARAM: 'bike_id query param is required',
  ADD_BIKE_PARAMS: 'user_id, make, model, year, and odo are required',
  UPDATE_BIKE_PARAMS: 'id, user_id, make, model, year, and odo are required',
  DELETE_BIKE_PARAMS: 'bike_id and user_id are required',
  BIKE_AND_NAME_PARAMS: 'bike_id and name are required',
  MAINTENANCE_LOG_PARAMS: 'bike_id, name, date, and odo are required',
  INT_KM_PARAM: 'interval_km is required',
  INT_DAYS_PARAM: 'interval_days is required',
  INT_KM_POSITIVE: 'interval_km must be a positive integer',
  INT_DAYS_POSITIVE: 'interval_days must be a positive integer',
  ODO_NON_NEG: 'odo must be a non-negative integer',

  // Bikes
  BIKE_EXISTS: 'Bike already exists',
  BIKE_NOT_FOUND: 'Bike not found',
  BIKE_CREATE_SUCCESS: 'Bike created successfully',
  BIKE_CREATE_FAIL: 'Create bike failed:',
  BIKE_UPDATE_SUCCESS: 'Bike updated successfully',
  BIKE_UPDATE_FAIL: 'Update bike failed:',
  BIKE_DELETE_SUCCESS: 'Bike deleted successfully',
  BIKE_DELETE_FAIL: 'Delete bike failed:',
  BIKE_LIST_FAIL: 'List bikes failed:',
  BIKE_YEAR_BETWEEN_ERROR: 'Year must be an integer between 1900 and 2100',
  BIKE_INVALID_YEAR_ERROR: 'Invalid year',
  BIKE_ODO_DECR_ERROR: 'Odometer cannot decrease',

  // Maintenance
  MAINTENANCE_LOG_FIELDS: 'At least one maintenance log field must be provided',
  INVALID_DATE: 'Invalid date',
  MAINTENANCE_CREATE_SUCCESS: 'Maintenance created successfully',
  MAINTENANCE_LOG_CREATE_SUCCESS: 'Maintenance log created successfully',
  MAINTENANCE_LOG_CREATE_FAIL: 'Create maintenance log failed:',
  MAINTENANCE_UPDATE_SUCCESS: 'Maintenance updated successfully',
  MAINTENANCE_SCHEDULE_SUCCESS: 'Maintenance scheduled successfully',
  MAINTENANCE_UPDATE_FAIL: 'Update maintenance failed:',
  MAINTENANCE_LIST_FAIL: 'List maintenance failed:',
  MAINTENANCE_LOG_LIST_FAIL: 'List maintenance logs failed:',

  // Misc
  INTERNAL_SERVER_ERROR: 'Internal server error',
  FAIL_START_SERVER: 'Failed to start server:',
  DB_URL_REQ: 'DATABASE_URL is required',
  API_RUNNING: 'MotoCare Maintenance Tracker API is running',
};
