export interface AuthSignInPayload {
  password: string;
  username: string;
  sys_module_id: string;
}

export interface AuthSignInResult {
  accessToken: string;
  expiresIn: Date;
  refreshToken: string;
  tokenType: string;
}
