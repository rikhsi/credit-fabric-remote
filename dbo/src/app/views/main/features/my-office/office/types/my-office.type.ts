import { ID, Logo, ResponseConfig, UUID } from '../../../transport/types/transport.types';


export type OfficeDetails = {
  name: string;
  officeNumber: string;
  street: string;
  city: string;
  uuid: string;
};

// LIST
export type MyOfficesResponse = ResponseConfig<MyOfficesData>;
export type MyOfficesData = {
  myHomes: MyOfficeItem[];
  count: number;
};
export type MyOfficeItem = OfficeDetails;

// ======================================
// OFFICE
export type MyOfficeRequest = ID<string>;
export type MyOfficeResponse = ResponseConfig<MyOfficeData>;
export type MyOfficeData = OfficeDetails & { services: MyOfficeService[] };
// ADD
export type AddMyOfficeRequest = Omit<OfficeDetails, 'uuid'>;
export type AddMyOfficeResponse = ResponseConfig<OfficeDetails>;
// EDIT
export type EditMyOfficeRequest = OfficeDetails;
export type EditMyOfficeResponse = ResponseConfig<OfficeDetails>;

// REMOVE
export type RemoveMyOfficeRequest = ID<string>;
export type RemoveMyOfficeResponse = MessageResponse;

// ======================================
// SERVICE
export type MyOfficeService = {
  uuid: string;
  title: string;
    service: ID<string>;
  logo: Logo;
  params: Params[];
  balance: AmountData;
  amount: AmountData;
  mainField: string | null;
  sortOrder: number;
};

// CHECK
export type MyOfficeServiceCheckResponse = ResponseConfig<{
  params: PSCDataParam[];
}>;
// REFRESH
export type MyOfficeServiceRefreshResponse = ResponseConfig<MyOfficeService>;

// ADD
export type AddMyOfficeServiceRequest = {
  myOffice: ID<string>;
  title: string;
  service: ID<string>;
  amount: AmountData;
  sortOrder?: number;
  params: Params[];
};
export type AddMyOfficeServiceResponse = ResponseConfig<MyOfficeService>;

// REMOVE
export type EditMyOfficeServiceRequest = Omit<AddMyOfficeServiceRequest, 'myOffice'> &
  UUID<string>;
export type EditMyOfficeServiceResponse = MessageResponse;
export type RemoveMyOfficeServiceRequest = ID<string>;
export type RemoveMyOfficeServiceResponse = MessageResponse;
export type AmountData = {
  amount: number;
  scale: number;
  currency: string;
};
export type MessageResponse = ResponseConfig<{ message: string }>;

export type Params = {
  id?: number;
  uuid?: string;
  key?: string;
  prefix?: string | null;
  value: string | number | boolean;
  suffix?: string | null;
};
export type PSCDataParam = {
  title: string;
  value: string;
  mask?: null;
  type?: string;
  options?: null;
};
export type PaymentNavResponse = ResponseConfig<PaymentNavData>;
export type PaymentNavData = {
  categories: PaymentNavItem[];
  count: number;
};
export type PaymentNavItem = {
  id: string | null;
  uuid: string;
  title: string;
  type: string;
  merchant: string;
  logo: Logo;
  cashbackRate: number | null;
  technicalWorks: boolean;
  autoPay: boolean;
  customId: number | null;
};
export type PSORequest = UUID<string>;
export type PSOResponse = ResponseConfig<PSOData>;
export type PSOData = {
  id: number;
  uuid: string;
  group: string;
  title: string;
  logo: Logo;
  minAmount: AmountData;
  maxAmount: AmountData;
  merchant: string;
  cashbackRate: number;
  editable: boolean;
  params: ParamData[];
};
export type ParamData = {
  id: number;
  uuid: string;
  title: string;
  required: boolean;
  readOnly: boolean;
  mask: string;
  placeholder: string;
  type: string;
  canValidate: boolean;
  canValue: boolean;
  bind: string;
  prefix: string[];
  suffix: string[];
  value: string;
  cashbackRate: number;
  selectValue: SelectValue[];
};
export type SelectValue = {
  title: string;
  value: string;
  prefix: string;
  icon: Logo;
  cashbackRate: number;
  children: SelectValue[];
};
