import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { UserType } from '../../../shared/models/user-type.model';
import { CardType } from '../../../shared/models/card-type';

export const STATEMENT_MODE = { CREATE: 'create', EDIT: 'edit', REPEAT: 'repeat' } as const;

export type StatementMode = (typeof STATEMENT_MODE)[keyof typeof STATEMENT_MODE];

export const STATEMENT_MODE_TITLE_KEY: Record<StatementMode, string> = {
  create: 'salaryStatements.create_statement_form',
  edit: 'salaryStatements.edit',
  repeat: 'accountStatements.retry',
};

export type SalaryPrepareReqControls = {
  cardUserType: FormControl<UserType>;
  cardType: FormControl<CardType>;
  docNum: FormControl<string>;
  reestrNumber: FormControl<string>;
  contractNumber: FormControl<string>;
  useTransit: FormControl<boolean>;
  senderAccount: FormControl<string>;
  transitAccount: FormControl<string>;
  name: FormControl<string>;
  paymentSource: FormControl<string>;
  docDate: FormControl<Date>;
  paymentCode: FormControl<string>;
  year: FormControl<number>;
  months: FormControl<string[]>;
  description: FormControl<string>;
};

export type SalaryCardPrepareControls = {
  accountNumberCard: FormControl<string>;
  amountTransferToCard: FormControl<number | ''>;
  fio: FormControl<string>;
  maskedPan: FormControl<string>;
};

export type PrepareSalaryCardTransactionControls = {
  salaryPrepareReq: FormGroup<SalaryPrepareReqControls>;
  employeesItems: FormArray<FormGroup<SalaryCardPrepareControls>>;
};

export const MONTH_NAMES = [
  'Январь','Февраль','Март','Апрель','Май','Июнь',
  'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'
] as const;

export type MonthName = typeof MONTH_NAMES[number];
