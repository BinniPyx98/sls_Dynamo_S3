/**
 * This file should contain all required interfaces for the feature
 */

export interface UserPresenceInDbInterface {
  error: boolean;
  data: string;
}

export interface UserAuthData {
  email: string;
  password: string;
}

export interface RegistrationResponse {
  statusCode: number;
  body: string;
}
