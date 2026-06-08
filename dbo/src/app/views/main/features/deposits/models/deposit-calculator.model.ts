export enum RateModifierEnum {
  WITH_CAPITALIZATION = 'WITH_CAPITALIZATION',
  WITHOUT_CAPITALIZATION = 'WITHOUT_CAPITALIZATION',
}

export enum RateModifierByConditionEnum {
  WITH_PARTIAL_WITHDRAWAL = 'WITH_PARTIAL_WITHDRAWAL',
  WITHOUT_PARTIAL_WITHDRAWAL = 'WITHOUT_PARTIAL_WITHDRAWAL',
}

export enum DepositWithdrawFrequencyEnum {
  AT_THE_END_OF_TERM = 'AT_THE_END_OF_TERM',
  MONTHLY = 'MONTHLY',
}

export interface DepositCalculatorDaysDto {
  dayEnd: number;
  dayFrom: number;
}

export interface CalculationResponse {
  amount: number;
  percentage: number;
}
