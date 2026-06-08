export interface OperDayDto {
  companyId: string;
  companyOperationMode: string;
  currentWorkingDate: Date;
  lastWorkingDate: Date;
  nextWorkingDate: Date;
  changedOn: string
  interbank: string
  interbranch: string
  operday: string
  toBudget: string
  toCbu: string
  actual: any
}
