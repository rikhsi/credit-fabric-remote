import {TableColumn} from "../../app/shared/interfaces/table.interface";

export const code = [
  {
    name: ''
  }
]
export const DashboardTableColumnsHeaders: TableColumn[] = [
  { header: 'Дата', field: 'docDate' ,left: true},
  { header: 'Номер документа', field: 'docNum' ,left: true},
  { header: 'Получатель/Отправитель', field: 'receiverName' ,left: true },
  { header: 'Счет', field: 'senderAcc', left: true },
  { header: 'Сумма', field: 'amount.amount', left: true },
  { header: 'Дата создание', field: 'time', left: true },
  { header: 'Статус', field: 'status', left: true },
];

export const Transactions = [
  {
    date:"21.04.2025",
    sender:"MChJ «DAFNA MEBEL NSV»",
    purpose:"Оплата государственной пошлины за регистрацию изменений в уставе",
    amount:1400000000,
    status:"Проведен"
  },
  {
    date:"21.04.2025",
    sender:"MChJ «DAFNA MEBEL NSV»",
    purpose:"Оплата государственной пошлины за регистрацию изменений в уставе. .",
    amount:1400000000,
    status:"Проведен"
  },
  {
    date:"21.04.2025",
    sender:"MChJ «DAFNA MEBEL NSV»",
    purpose:"Оплата в уставе. Идентификатор платежа: GPOSH250504A.",
    amount:110000000,
    status:"Проведен"
  },
  {
    date:"21.04.2025",
    sender:"MChJ «DAFNA MEBEL NSV»",
    purpose:"Оплата цию изменений в уставе. Идентификатор платежа: GPOSH250504A.",
    amount:1400000000,
    status:"Проведен"
  },
  {
    date:"21.04.2025",
    sender:"MChJ «DAFNA MEBEL NSV»",
    purpose:"Оплата  Идентификатор платежа: GPOSH250504A.",
    amount:1400000000,
    status:"Проведен"
  },

]
