export interface ProductItem {
  code: string;
  conditions: ProductConditionItem[];
  created: Date;
  dateFrom: Date;
  dateTo: Date;
  id: string;
  isActive: true;
  name: string;
  tag: string;
}

export interface ProductConditionItem {
  created: Date;
  currencyId: string;
  defaultAmount: number;
  defaultTerm: number;
  gracePeriod: number;
  id: string;
  interestRate: number;
  isActive: true;
  isDefault: true;
  maxAmount: number;
  maxTerm: number;
  minAmount: number;
  minTerm: number;
  productId: string;
  rateTypeId: string;
  riskGradeId: string;
  segmentId: string;
  sliderStep: number;
  termTypeId: string;
  updated: Date;
}
