import { TransactionTypes } from '../../../core/models/transaction.models';

export const TransactionStatus =[
  {
    name:"Подтверждение",
    value:"PREPARE"
  },
  {
    name:"Подтверждение директора",
    value:"PREPARE_DIRECTOR"
  },
  {
    name:"В ожидании",
    value:"PENDING"
  },
  {
    name:"Успешно",
    value:"SUCCESS"
  },
  {
    name:"Отмена",
    value:"CANCEL"
  },
  {
    name:"Ошибка",
    value:"ERROR"
  }
]

export interface ITransactionMode {
  name: string;
  value: TransactionTypes;
}

export const TransactionMode:ITransactionMode[] =[
  {
    name:"",
    value: TransactionTypes.TRANSACTION
  },
  {
    name:"",
    value: TransactionTypes.SWIFT
  },
  {
    name:"",
    value: TransactionTypes.BUDGET
  },
  {
    name:"",
    value: TransactionTypes.SALARY
  },
  {
    name:"",
    value: TransactionTypes.CARD
  },
  {
    name:"",
    value: TransactionTypes.PAYNET
  },
  {
    name:"",
    value: TransactionTypes.DEPOSIT_WITHDRAW
  },
  {
    name:"",
    value: TransactionTypes.LOAN_REPAYMENT
  },
  {
    name:"",
    value: TransactionTypes.LOAN_PRETERM
  },
]


export const TransactionModes =[
  {
    name:"Контрагенту",
    value:"TRANSACTION",
  },
  {
    name:"В бюджет",
    value:"BUDGET",
  },
  {
    name:"В бюджетный доход",
    value:"BUDGET_INCOME",
  },
  // {
  //   name:"Мунис",
  //   value:"P2SERVICE",
  // },
  // {
  //   name:"Между своими счетами",
  //   value:"BETWEEN_ACCOUNTS",
  // },
];

export const PURPOSE_CODES = {

}
