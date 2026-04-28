export type AuthUser = {
  id: string;
  email: string;
};

export type AuthSuccessUser = {
  id: string;
  email: string;
};

export type LoginResponse = {
  message: string;
  user: AuthSuccessUser;
};

export type RegisterResponse = {
  message: string;
};

export type AuthErrorResponse = {
  error: string;
};
