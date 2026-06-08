export interface TokenInitResponse {
  identityToken: string;
  expireTime: number;
  businessList: Array<{businessId:number,businessName:string}>;
}

export interface TokenConfirmRequest {
  businessId: number;
  identityToken: string;
}

export interface TokenConfirmResponse {
  userId: string;
  username: string;
  role: string;
  roleName: string;
  permissions: string[];
  refreshToken: string;
  accessToken: string;
  accessTokenExpire: string;
  refreshTokenExpire: string;
}
