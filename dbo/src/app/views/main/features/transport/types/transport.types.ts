
export type TransportResponse = ResponseConfig<TransportList>;
export type TransportInfoResponse = ResponseConfig<TransportInfoData>;

export type TransportList = {
  myAutoList: MyAutoData[];
  count: number;
};
export type MyAutoData = {
  carName: string;
  carNumber: string;
  color: string;
  image: Logo;
  modelLogo: Logo;
  uuid: string;
  year: number;
};
export type TransportInfoData = {
  affidavitDate: string;
  affidavitDay: number;
  driverLicense: DriverLicense;
  gasDate: string;
  gasDay: number;
  insuranceDate: string;
  insuranceDay: number;
  oilDate: string;
  oilDay: number;
  oilKm: string;
  tintingDate: string;
  tintingDay: number;
};
export type DriverLicense = {
  fio: string;
  categories: string;
  serialNumber: string;
  dayLeft: number;
  startDate: string;
  endDate: string;
};

export type TransportTabItem = {
  id: number;
  img: string;
  title: string;
  date: string;
  day: number;
};

// TRANSPORT
export type TransportAddRequest = {
  plateNumber: string;
  texPassport: string;
};
export type TransportAddResponse = ResponseConfig<TransportAddData>;
export type TransportAddData = {
  autoId: string;
  pKuzov: string;
  pTexpassportSery: string;
  pVehicleColor: string;
  pTexpassportNumber: string;
  pRegistrationDate: string;
  pDivision: string;
  pMotor: string;
  pModel: string;
  pFullWeight: number;
  pYear: number;
  pPlateNumber: string;
  pShassi: string;
};

export type AutoInfoFormRequest = {
  gasStartDate?: string;
  gasEndDate?: string;
  startDate: string;
  endDate: string;
  autoId: string;
  type: string;
};
export type AutoInfoFormResponse = ResponseConfig<AutoInfoData>;
export type AutoInfoData = {
  gasStartDate?: string;
  gasEndDate?: string;
  startDate: string;
  endDate: string;
  type: string;
  // OIL
  replacementDate?: string;
  currentKm?: number;
  dailyKm?: number;
  oilBrand?: string;
  oilWalkingKm?: number;
};
export type AutoInfoResponse = AutoInfoFormResponse;

// TRANSPORT REFRESH
// ? transportSaved is field from BE
export type TransportRefreshResponse = ResponseConfig<{
  transportSaved: boolean;
}>;
export type ResponseConfig<T> = {
  result: { data: T } & MetaResponse;
  success: boolean;
  message?: string;
};

export type ID<T> = {
  id: T;
};
export type UUID<T> = {
  uuid: T;
};
export type MetaResponse = { code: number; message: string; audit: string };
export type Logo = {
  contentType?: string;
  path: string;
  ext: string;
  extraSuffix: string[];
  name: string;
  suffix?: string | null;
};
export const daysInName = (lang: string, days: number): string => {
  switch (lang) {
    case 'Ru':
      return `${days} ${
        days === 1
          ? 'день'
          : days > 4 || (days > 10 && days % 10 > 2)
            ? 'дней'
            : 'дня'
      }`;
    case 'En':
      return `${days} ${days === 1 ? 'day' : 'days'}`;
    case 'Uz':
      return `${days} kun`;
    case 'Kaa':
      return `${days} kún`;
    case 'Krl':
      return `${days} кун`;
  }
  return '';
};
export type SelectValueType = {
  label: string;
  value: string;
}[];
