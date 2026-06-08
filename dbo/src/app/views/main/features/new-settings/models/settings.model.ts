
export type UsersDto = {
  content: UsersContent[];
  totalElements: number
  totalPages: number
}

export type UsersContent = {
  id: number
  email: string
  firstname: string
  lastname: string
  avatar: string
  inn: string
  pnfl: string
  asSerialNumber: string
  status: string
  passwordChange: true
  username: string
  roleName: string
  roleType: string
}

export interface RoleDto {
  id: string;
  name: string;
  displayName: string;
}

export interface SettingUserInfoDto {
  id: number;
  email: string;
  uuid: string;
  clientId: string;
  clientUid: string;
  businessUserId: string;
  styxSerialNumber: string;
  styxOrgUnit: string;
  firstname: string;
  lastname: string;
  phone: string;
  avatar: string;
  inn: string;
  pnfl: string;
  asSerialNumber: string;
  status:  string;
  passwordChange: boolean;
  reinviteEnabled?: boolean;
  username: string;
  role: SettingUserRole;
  bxmCodes?: Record<string, string>;
  userUuid: string;
  permissions?: SettingPermission[];
  roles?: SettingUserRole[];
}

export interface SettingUserRole {
  name: string;
  displayName: string;
  userPermissions: SettingUserPermission[];
  permissionWindow: SettingPermissionWindow[];
  currencyGroupPermissions: string[];
  id: string;
  isAdmin: boolean;
}

export interface SettingUserPermission {
  name: string;
  displayName: string;
  methodName: string;
  windowName: string;
  controllerName: string;
  module: SettingPermissionModule[];
  id: string;
}

export interface SettingPermissionModule {
  name: string;
  types: string[];
}

export interface SettingPermissionWindow {
  module: string;
  types: Record<string, boolean>;
}


export interface SettingPermission {
  module: string;
  moduleName: string;
  types: Record<string, boolean>;
}
export interface DeviceInfo {
  uuid: string;
  appVersion: string | null;
  deviceId: string;
  deviceType: string;
  deviceModel: string | null;
  isTrusted: boolean;
  lang:  string;
  isMain: boolean;
  current: boolean;
  isBlock: boolean;
  lastLogin: string;
  os: string | null;
  online?: boolean;
  ipAddress?: string | null;
}

export interface ParamInfo {
  commonName: string;
  surName: string;
  locality: string;
  state: string;
  country: string;
  street: string;
  email: string;
  uzINN: string;
  uzPINFL: string;
  userId: string;
  organisation: string;
  organisationUnit: string;
}

export interface BusinessInfo {
  clientUid: number;
  directorName: string;
  mainFilial: string;
  phone: string;
  name: string;
  oked: string;
  filialCode: string;
  clientId: number;
  address: string;
  inn: string;
  clientCode: string;
  registrationDocumentNumber: string;
  enteredUser: string;
  pinfl: string;
  paramInfo: ParamInfo;
  email: string;
  roleName: string;
  roleDisplayName: string;
  organizationName: string;
}
export interface RoleInfo {
  id: string;
  name: string;
  displayName: string;
}

export interface NotificationCategoryDto {
  notifyCategory: string;
  categoryTitle: string;
  minChannelCount: number;
  isActive: boolean;
  channelSettings: ChannelSettingDto[];
}
export interface ChannelSettingDto {
  notifyChannel: string;
  enabled: boolean;
  mandatory: boolean;
}
export interface NotificationSilenceDto {
  from?: string;
  to?: string;
  status?: string;
}
export interface PaymentValue {
  amount: number;
  scale: number;
  currency: string;
}

export interface TariffDto {
  agreementDate: string;
  agreementNum: string;
  clientId: number;
  branchId: number;
  clientInit: string;
  currency: string;
  filialCode: string;
  paymentValue: PaymentValue;
  status: number;
  tariffId: number;
  tariffName: string;
  branchName: string;
}
