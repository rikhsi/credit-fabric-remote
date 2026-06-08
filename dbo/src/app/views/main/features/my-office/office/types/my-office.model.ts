export interface SubCategoriesResponse {
  categories: SubCategoryDto[];
  count: number;
}

export interface SubCategoryDto {
  autoPay: boolean;
  cashbackRate: number;
  hasInfo: boolean;
  id: null | string;
  logo: null | string;
  merchant: string;
  technicalWorks: boolean;
  title: string;
  type: string;
  uuid: string;
}

export interface ServiceOneDto {
  cashbackRate: number;
  editable: boolean;
  group: string;
  hasInfo: boolean;
  id: number;
  logo: null | string;
  maxAmount: AmountDto;
  merchant: string;
  minAmount: AmountDto;
  params: ParamsDto[];
  service:{
    id:string
  }
  title: string;
  uuid: string;
}

interface AmountDto {
  amount: number;
  scale: number;
  currency: string;
}

export interface ParamsDto {
  bind: null | any;
  canValidate: boolean;
  canValue: boolean;
  cashbackRate: number;
  id: number;
  mask: null | any;
  placeholder: null | any;
  prefix: null | any;
  readOnly: boolean;
  required: boolean;
  selectValue: RegionsDto[];
  suffix: null | any;
  title: string;
  type: InputType;
  uuid: string;
  value: null | any;
}

type InputType = 'SELECT' | 'PHONE' | 'INTEGER';

export interface RegionsDto {
  cashbackRate: number;
  children: RegionsDto[] | any[];
  icon: null | any;
  prefix: null | any;
  title: string;
  value: string;
}

export interface PaynetCheckRequest {
  uuid: string;
  params: ParamsDto[];
}

export interface AddServiceRequest {
  myOffice: {
    id: string;
  };
  title: string;
  service: {
    id: string;
  };
  amount: {
    amount: 0;
    scale: 0;
    currency: string;
  };
  sortOrder: 0;
  params: [
    {
      id: 0;
      uuid: string;
      key: string;
      prefix: string;
      value: string;
      suffix: string;
    }
  ];
}
