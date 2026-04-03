// API
export const INTERNAL_SERVER_ERROR = ' Internal Server Error';
export const REG_FAILED = 'Registration failed';
export const LOGIN_FAILED = 'Login failed';
export const NO_USER = 'No logged-in user';
export const NO_BIKE = 'Bike not found';
export const FAIL_FETCH_BIKES = 'Failed to fetch bikes';
export const FAIL_CREATE_BIKE = 'Failed to create bike';
export const FAIL_UPDATE_BIKE = 'Failed to update bike';
export const FAIL_DELETE_BIKE = 'Failed to delete bike';
export const FAIL_FETCH_MAINTENANCE = 'Failed to fetch maintenance';
export const FAIL_LOG_MAINTENANCE = 'Failed to log maintenance';
export const FAIL_UPSERT_MAINTENANCE = 'Failed to upsert maintenance';
export const FAIL_FETCH_MAINTENANCE_LOGS = 'Failed to fetch maintenance logs';
export const FAIL_CREATE_MAINTENANCE_LOGS = 'Failed to create maintenance log';
export const INVALID_YEAR = 'Invalid year';
export const INVALID_ODO = 'Invalid odo';

// Auth
export const USER_REGISTER_SUCCESS = 'Registration successful';
export const USER_LOGIN_SUCCESS = 'Login successful';
export const USER_EXIST = 'User already exists';
export const INVALID_EMAIL = 'Invalid email format';
export const EMAIL_PASS_REQUIRED = 'Email and password are required';
export const EMAIL_REQUIRED = 'Email is required';
export const PASS_REQUIRED = 'Password is required';
export const CONFIRM_PASS_REQUIRED = 'Confirm password is required';
export const PASS_SHORT = 'Password must be 8 characters at minimum';
export const PASS_LONG = 'Password must be 32 characters at maximum';
export const PASS_NOT_MATCH = 'Passwords do not match';
export const INVALID_CREDENTIALS = 'Invalid credentials';

// Bike
export const BIKE_CREATE_SUCCESS = 'Bike created successfully';
export const BIKE_UPDATE_SUCCESS = 'Bike updated successfully';
export const BIKE_DELETE_SUCCESS = 'Bike deleted successfully';
export const YEAR_BETWEEN_ERROR =
  'Year must be an integer between 1900 and 2100';
export const ODO_NON_NEGATIVE = 'Odometer must be a non-negative integer';
export const ODO_CANNOT_DECREASE = 'Odometer cannot decrease';
export const ODO_REQUIRED = 'Odometer is required';

// Maintenance
export const MAINTENANCE_CREATE_SUCCESS = 'Maintenance created successfully';
export const MAINTENANCE_SCHEDULE_SUCCESS =
  'Maintenance scheduled successfully';
export const ODO_NEGATIVE_ERROR = 'odo must be a non-negative integer';
export const INTERVAL_DAYS_REQUIRED = 'interval_days is required';
export const INTERVAL_KM_REQUIRED = 'interval_km is required';
