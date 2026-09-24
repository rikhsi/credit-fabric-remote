import { ApplicationStatus, OnlineApplication, OnlineOffer } from '@api/models/los/application';
import { OnlineGetInfoResult } from '@api/models/los/online';

const PRODUCT_NAME = 'Biznesga qadam';
const ISSUE_DATE = '2026-09-12';
const CREATED_DATE = '2026-09-10T10:00:00';

const baseProduct = {
  loanAmount: 50_000_000,
  loanRate: 15,
  loanTerm: 12,
  monthlyPayment: 500_000,
  paymentType: 'annuity',
  product: PRODUCT_NAME,
};

const baseBorrower: OnlineApplication['borrower'] = {
  docPersonalLegalNo: 'AA1234567',
  email: 'mock@example.com',
  employees: 3,
  id: 1,
  legalForm: { id: 'YATT', value: 'YATT' },
  name: 'YATT QOSIMOV UMID',
  newEmployees: null,
  oked: { id: '47110', value: 'Retail trade' },
  ownershipCode: { id: '1', value: 'Private' },
  registrationDate: new Date('2020-01-15'),
  registrationNumber: '123456789',
  registrationPlaceCode: '26',
  workPhone: null,
};

function listItem(
  id: number,
  status: ApplicationStatus,
  overrides: Partial<OnlineGetInfoResult> = {},
): OnlineGetInfoResult {
  return {
    id,
    creditAgreementId: id,
    decisionId: id,
    currency: 'UZS',
    docs: [],
    loanAmount: baseProduct.loanAmount,
    loanTerm: baseProduct.loanTerm,
    paymentType: baseProduct.paymentType,
    productName: PRODUCT_NAME,
    rate: baseProduct.loanRate,
    sysStatusId: status,
    createdDate: CREATED_DATE,
    ...overrides,
  };
}

function application(
  status: ApplicationStatus,
  overrides: Partial<OnlineApplication> = {},
): OnlineApplication {
  return {
    accountNo: '20208000900000001234',
    offerId: '',
    borrower: baseBorrower,
    docs: [],
    finData: [],
    product: { ...baseProduct },
    sysStatusId: status,
    ...overrides,
  };
}

function offer(offerId: string, overrides: Partial<OnlineOffer> = {}): OnlineOffer {
  return {
    offerId,
    product: PRODUCT_NAME,
    loanAmount: 50_000_000,
    loanRate: 15,
    loanTerm: 12,
    paymentType: 'annuity',
    issueDate: ISSUE_DATE,
    ...overrides,
  };
}

const docsUnsigned = [
  {
    id: 101,
    type: 'LOAN_DECISION',
    isSigned: false,
    createdDate: CREATED_DATE,
    signedDate: '',
  },
];

const docsSigned = [
  {
    id: 201,
    type: 'LOAN_DECISION',
    isSigned: true,
    createdDate: CREATED_DATE,
    signedDate: ISSUE_DATE,
  },
  {
    id: 202,
    type: 'LOAN_AGREEMENT',
    isSigned: true,
    createdDate: CREATED_DATE,
    signedDate: ISSUE_DATE,
  },
];

/** Mock application ids used in list + detail. */
export const MockApplicationId = {
  InProgress: 845791,
  OnDesign: 845792,
  OnDecisionOne: 845794,
  OnDecisionTwo: 845795,
  OnDecisionThree: 845796,
  Signed: 845797,
  Issued: 845798,
  Decline: 845799,
  DeclineClient: 845800,
  Error: 845801,
} as const;

export const MOCK_APPLICATIONS_LIST: OnlineGetInfoResult[] = [
  listItem(MockApplicationId.InProgress, ApplicationStatus.InProgress),
  listItem(MockApplicationId.OnDesign, ApplicationStatus.OnDesign),
  listItem(MockApplicationId.OnDecisionOne, ApplicationStatus.OnDecision, {
    loanAmount: 40_000_000,
  }),
  listItem(MockApplicationId.OnDecisionTwo, ApplicationStatus.OnDecision, {
    loanAmount: 50_000_000,
  }),
  listItem(MockApplicationId.OnDecisionThree, ApplicationStatus.OnDecision, {
    loanAmount: 60_000_000,
  }),
  listItem(MockApplicationId.Signed, ApplicationStatus.Signed),
  listItem(MockApplicationId.Issued, ApplicationStatus.Issued),
  listItem(MockApplicationId.Decline, ApplicationStatus.Decline),
  listItem(MockApplicationId.DeclineClient, ApplicationStatus.DeclineClient),
  listItem(MockApplicationId.Error, ApplicationStatus.Error),
];

export const MOCK_APPLICATIONS_BY_ID: Record<number, OnlineApplication> = {
  [MockApplicationId.InProgress]: application(ApplicationStatus.InProgress),
  [MockApplicationId.OnDesign]: application(ApplicationStatus.OnDesign, { docs: docsUnsigned }),
  [MockApplicationId.OnDecisionOne]: application(ApplicationStatus.OnDecision, {
    product: { ...baseProduct, loanAmount: 50_000_000 },
    offerId: 'offer-1',
  }),
  [MockApplicationId.OnDecisionTwo]: application(ApplicationStatus.OnDecision, {
    product: { ...baseProduct, loanAmount: 45_000_000 },
    offerId: 'offer-1',
  }),
  [MockApplicationId.OnDecisionThree]: application(ApplicationStatus.OnDecision, {
    product: { ...baseProduct, loanAmount: 50_000_000 },
    offerId: 'offer-1',
  }),
  [MockApplicationId.Signed]: application(ApplicationStatus.Signed, { docs: docsSigned }),
  [MockApplicationId.Issued]: application(ApplicationStatus.Issued, { docs: docsSigned }),
  [MockApplicationId.Decline]: application(ApplicationStatus.Decline),
  [MockApplicationId.DeclineClient]: application(ApplicationStatus.DeclineClient),
  [MockApplicationId.Error]: application(ApplicationStatus.Error),
};

export const MOCK_OFFERS_BY_ID: Record<number, OnlineOffer[]> = {
  [MockApplicationId.OnDecisionOne]: [
    offer('offer-1', {
      loanAmount: 40_000_000,
      loanTerm: 12,
      loanRate: 15,
    }),
  ],
  [MockApplicationId.OnDecisionTwo]: [
    offer('offer-more', {
      loanAmount: 55_000_000,
      loanTerm: 18,
      loanRate: 14,
    }),
    offer('offer-base', {
      loanAmount: 45_000_000,
      loanTerm: 12,
      loanRate: 15,
    }),
  ],
  [MockApplicationId.OnDecisionThree]: [
    offer('offer-more', {
      loanAmount: 60_000_000,
      loanTerm: 18,
      loanRate: 14,
    }),
    offer('offer-base', {
      loanAmount: 50_000_000,
      loanTerm: 12,
      loanRate: 15,
    }),
    offer('offer-less', {
      loanAmount: 35_000_000,
      loanTerm: 12,
      loanRate: 16,
    }),
  ],
};
