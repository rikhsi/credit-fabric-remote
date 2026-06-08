import { InterestScheduleData, InterestScheduleItem } from './components/modals/interest-schedule-modal/interest-schedule-modal.component';
import { DepositDetailsMock } from './components/modals/deposit-details-modal/deposit-details-modal.component';

export const MOCK_INTEREST_SCHEDULE: InterestScheduleItem[]=  [
    { month: 'Январь 2025',  amount: 1345000, currency: 'UZS' },
    { month: 'Февраль 2025', amount: 1345000, currency: 'UZS' },
    { month: 'Март 2025',    amount: 1345000, currency: 'UZS' },
    { month: 'Апрель 2025',  amount: 1345000, currency: 'UZS' },
    { month: 'Май 2025',     amount: 1345000, currency: 'UZS' },
    { month: 'Июнь 2025',    amount: 1345000, currency: 'UZS' },
    { month: 'Июль 2025',    amount: 1345000, currency: 'UZS' },
  ]


export const MOCK_DEPOSIT_DETAILS: DepositDetailsMock = {
  status: 'ACTIVE',
  balance: 7562321.42,
  currency: 'UZS',
  accountNumber: '20214123456789012345',
  openedAt: '20 марта 2025, 13:26',
  depositName: 'Депозит "OSON PLUS"',
  contractNumber: 'DPZ-2024/0312',
  interestRate: 18,
  type: 'Срочный',
  openDate: '01.04.2025',
  closeDate: '11.03.2027',
  term: '20 месяцев (до 11.03.2027)',
  earlyWithdrawalCondition: 'Ставка 2% при снятии',
  replenishment: 'Разрешено',
  partialWithdrawal: 'Доступно',
  prolongation: 'Остаток депозита',
  accountOpening: 'Автоматически',
  monthlyAmount: 4500000,
};
