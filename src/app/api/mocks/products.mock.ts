import { ProductItem } from '@api/models/los/product';

const now = new Date('2026-01-01T00:00:00');

export const MOCK_PRODUCTS: ProductItem[] = [
  {
    id: 'biznesga-qadam',
    code: 'BQ',
    name: 'Biznesga qadam',
    tag: 'biznesga-qadam',
    isActive: true,
    created: now,
    dateFrom: now,
    dateTo: new Date('2030-01-01T00:00:00'),
    conditions: [
      {
        id: 'bq-default',
        productId: 'biznesga-qadam',
        created: now,
        updated: now,
        currencyId: 'UZS',
        defaultAmount: 50_000_000,
        defaultTerm: 12,
        gracePeriod: 0,
        interestRate: 15,
        isActive: true,
        isDefault: true,
        maxAmount: 100_000_000,
        maxTerm: 36,
        minAmount: 5_000_000,
        minTerm: 6,
        rateTypeId: 'fixed',
        riskGradeId: 'A',
        segmentId: 'sme',
        sliderStep: 1_000_000,
        termTypeId: 'month',
      },
    ],
  },
];
