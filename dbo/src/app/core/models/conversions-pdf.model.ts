export interface ConversionsApplicationModel {
  senderAmount: number;
  senderCurr: string;
  senderAmountInWords: string;
  senderAcc: number;
  senderMfo: number;

  receiverAmount: number;
  receiverCurr: string;
  receiverAmountInWords: string;
  receiverAcc: number;
  receiverMfo: number;

  director?: string;
  chiefAccountant?: string;
}
