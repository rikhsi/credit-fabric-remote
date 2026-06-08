
export interface Booking {
  clientId: number;
  reserveId: number;
  operDay: string;       // Could be Date if it's a date string
  period: string;
  clAcc: string;
  clientCode: string;
  clAccount: string;
  sumDoc: number;
  sumReserved: number;
  sumPaid: number;
  sumUnlead: number;
  docNum: string;
  cashSymbol: string;
  purposeName: string;
  docDate: string;       // Could be Date if it's a date string
  state: string;
  stateName: string;
  branchId: number;
  localCode: string;
  clName: string;
  bronToPay: number;
  sumNeed: number;
  saldoObAcc: number;
  sumCard2: number;
}
