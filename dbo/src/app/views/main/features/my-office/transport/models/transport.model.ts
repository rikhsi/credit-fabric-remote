export interface MyAutoDto {
  carName: string;
  carNumber: string;
  color: string;
  regionNum?: string;
  image: {
    contentType: string;
    ext: string;
    extraSuffix: any;
    name: string;
    path: string;
    suffix: null | any;
  };
  modelLogo: {
    contentType: string;
    ext: string;
    extraSuffix: any;
    name: string;
    path: string;
    suffix: null;
  };
  uuid: string;
  year: number;
}

export interface MyAutoInsuranceDto {
  type: string;
  insuranceOrgName: string;
  sery: string;
  number: string;
  startDate: string;
  endDate: string;
  driversFio: string[];
}

export interface MyAutoInfoDto {
  insuranceDay: number;
  insuranceDate: string;
  tintingDay: number;
  tintingDate: string;
  affidavitDay: number;
  affidavitDate: string;
  gasDay: number;
  gasDate: string;
  oilDay: number;
  oilKm: string;
  oilDate: string;
  driverLicense: {
    fio: string;
    categories: string;
    serialNumber: string;
    dayLeft: number;
    startDate: string;
    endDate: string;
  };
}
export interface MyAutoLicenseDto {
  pinfl: string;
  owner: string;
  beginDate: string;
  ownerBirthDate: string;
  serialNumber: string;
  endDate: string;
  document: string;
  issuedBy: string;
  userId: string;
  licenseCategory: [
    {
      category: string;
      beginDate: string;
      endDate: string;
    }
  ];
}

export interface MyAutoInfo {
  // license: MyAutoLicenseDto[] | null;
  info: MyAutoInfoDto | null;
  insurance: MyAutoInsuranceDto | null;
}
