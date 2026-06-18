import { ApplicationStatus } from '@api/models/los/application';
import { OnlineGetInfoResult } from '@api/models/los/online';

/** Измените sysStatusId, чтобы проверить нужный view на странице детали заявки. */
export const APPLICATION_DETAIL_MOCK: OnlineGetInfoResult = {
  id: 1,
  creditAgreementId: 0,
  decisionId: 0,
  currency: 'UZS',
  loanAmount: 50_000_000,
  loanTerm: 18,
  paymentType: 'annuity',
  productName: 'Biznesga qadam',
  rate: 25,
  sysStatusId: ApplicationStatus.OnDecision,
  docs: [],
};
