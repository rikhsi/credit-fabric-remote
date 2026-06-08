export interface IStatementsDto {
  paging: {
    page: number;
    size: number;
  };
  id: any;
  account: string;
  transType: string;
  date: {
    dateBegin: string;
    dateClose: string;
  }
  autoId?: boolean;
  isPdf?: boolean;
}
