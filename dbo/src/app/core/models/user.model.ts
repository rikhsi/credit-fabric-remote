export interface UserDataDto {
  accessToken: string;
  accessTokenExpire: string | number;
  permissions: string[];
  refreshToken: string;
  refreshTokenExpire: string | number;
  role: userRole[];
  roleName: string;
  userId: string;
  permissionModules: any[];
  username: string;
  permissionWindow: string[];
  hashedBusinessId?:string
}

export interface userRole {
  name: string;
  displayName: string;
  id: number;
}

export interface VerifyIdentityResponse {
  message: string;
  identityToken: string;
  withKey: boolean;
}

export interface UserInfoDtoV2 {
  address: string;
  clientCode: string;
  clientId: number;
  clientUid: number;
  directorName: string;
  enteredUser: string;
  filialCode: string;
  imageHash: string | null;
  inn: string;
  mainFilial: string;
  name: string;
  oked: string;
  phone: string;
  pushToken: string | null;
  registrationDocumentNumber: string;
  roomToken: string | null;
}

export interface UserInfoDto {
  email?: string;
  clientCode: string;
  clientId: number;
  clientUid: number;
  directorName: string;
  enteredUser: string;
  filialCode: string;
  pinfl?: string;
  imageHash: string | null;
  inn: string;
  mainFilial: string;
  name: string;
  oked: string;
  phone: string;
  pushToken: string | null;
  registrationDocumentNumber: string;
  roomToken: string | null;
  msg: string;
  userInfo: {
    id: number;
    uuid: string;
    firstname: string;
    lastname: string;
    avatar: string;
    email: string;
    clientId: string;
    clientCode: string;
    clientUid: string;
    inn: string;
    pnfl: string;
    asSerialNumber: string;
    status: string;
    phoneNumber: string;
    username: string;
  };
  businessName: string;
  address: string;
  user: {
    userId: string
    businessId: string
    username: string
    password: string
    role: string
    roleName: string
    roleId: string
    roleType: string;
    position: string;
    permissionWindows: string[];
  }
  business: {
    id: number
    clientCode: string
    clientId: string
    clientUid: string
    inn: string
    mfo: string
    name: string
    status: string
  };
  jsonResponse: any;
  leftDaysToExpirePassword?: number;
  passwordExpireNotify?: boolean;
}

export interface NewNotification {
  id: number;
  title: string;
  body: string;
  shortBody: string;
  qrUrl: string | null;
  sendTime: string;
  status: 'UNREAD' | 'READ';
  notifyType: string;
  additionalId: any;
  notifyId: any;
  type: string;
}
