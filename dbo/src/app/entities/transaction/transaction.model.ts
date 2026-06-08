import { TransactionMode } from 'src/app/shared/models/transaction-mode.model';
import { PaymentStatus } from '../../shared/models/payment-status.model';
import { CardType } from '../../shared/models/card-type';

export interface PreparePaymentUzsTransactionResponse {
  id: string;
  transactionId: number;
  name: string;
  pin: boolean;
  pinOrder: number;
  docNum: string;
  senderLogo: string;
  senderAmount: {
    amount: number;
    scale: number;
    currency: string;
    logo: {
      contentType: string | null;
      path: string | null;
      name: string | null;
      ext: string | null;
    } | null;
  };
  sender: {
    pinfl: string | null;
    codeFilial: string;
    bankName: string;
    name: string;
    tax: string;
    account: string;
    icon: {
      contentType: string | null;
      path: string | null;
      name: string | null;
      ext: string | null;
    };
  };
  receiverLogo: string;
  receiverAmount: {
    amount: number;
    scale: number;
    currency: string;
    logo: {
      contentType: string | null;
      path: string | null;
      name: string | null;
      ext: string | null;
    } | null;
  };
  purpose: {
    code: string;
    name: string;
  };
  recipient: {
    pinfl: string | null;
    codeFilial: string;
    name: string;
    bankName: string;
    icon: {
      contentType: string | null;
      path: string | null;
      name: string | null;
      ext: string | null;
    };
    tax: string;
    account: string;
    regionCode: string | null;
    soatoCode: string | null;
    regionName: string | null;
    districtName: string | null;
  };
  externalId: string;
  docDate: string;
  absStatus: string;
  status: PaymentStatus;
  statusNameFront: string;
  signedList: {
    fullName: string;
    signDate: string;
    roleType: string;
    signOrderNumber: number;
    isFinished: boolean;
    status: string | null;
  }[];
  buttons: {
    name: string;
    actionType:
      | 'CREATE'
      | 'APPROVE'
      | 'SIGN'
      | 'REVERT'
      | 'SIGN_AND_SEND'
      | 'SEND'
      | 'DELETED_BY_ABS';
    statusNameFront: string;
  }[];
  type: string;
  statusLogo: {
    contentType: string | null;
    path: string | null;
    name: string | null;
    ext: string | null;
  };
  canUserSign: boolean;
  description: string;
  recipientCodeFilial: string;
  lastStatusTime: string;
  transactionMode: TransactionMode;
  additionalInfo: {
    accountNumberCard: string;
    cardType: CardType;
    contractNumber: string;
    months: string;
    parentId: string;
    reestrNumber: string;
    transitAccount: string;
    windowType: string;
    year: string;
    useTransit: string;
  };
  isDebit: boolean;
  parentId: number | null;
  errorMessage: string | null;
  fromAbs: boolean;
  withAnor: boolean;
  paymentCode: number;
  purposeCode: string;
  purposeName: string;
  audit: {
    createdBy: string;
    createdByName: string;
    updatedBy: string | null;
    updatedByName: string | null;
    createdAt: string;
    updatedAt: string | null;
  };
  createdDate: string;
}

export interface OperDayResponse {
  applicationId: string;
  operDay: string;
  messageInfo: string | null;
  actual: boolean;
}
