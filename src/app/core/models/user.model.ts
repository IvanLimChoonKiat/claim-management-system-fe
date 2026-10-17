export type UserRole = 'Claimant' | 'ClaimsOfficer';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
}

export interface DevLoginRequest {
  email: string;
  displayName: string;
  role: UserRole;
}

export interface DevLoginResponse {
  token: string;
  user: User;
}
