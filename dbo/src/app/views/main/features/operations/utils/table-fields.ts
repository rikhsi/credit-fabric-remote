export const tableColumnsCurrencyTransaction = [
    { header: '№ документа', field: 'docNum' },
    { header: 'Контрагент', field: 'recipient.name' },
    { header: 'Счет', field: 'recipient.account' },
    { header: 'Отправитель', field: 'sender.account' },
    { header: 'Сумма', field: 'senderAmount.amount' },
    { header: 'Валюта', field: 'senderAmount.currency' },
    { header: 'Дата', field: 'docDate' },
    { header: 'Статус', field: 'status' },
    { header: 'Код назначения', field: 'purpose.code' },
  ];

export const tableColumnsCurrencyApplication = [
  { header: 'Дата', field: 'createdDate' },
  { header: 'ID заявления', field: 'applicationId' },
  { header: 'Наименование контрагента', field: 'swiftApplicationDto.beneficiary59Name' },
  { header: 'Счет плательщика', field: 'swiftApplicationDto.senderAccount' },
  { header: 'Сумма', field: 'swiftApplicationDto.senderAmount32' },
  { header: 'Валюта', field: 'swiftApplicationDto.senderCurrency32' },
  { header: 'Статус', field: 'applicationStatus' },
]

export const tableColumnsCurrencySellApplication = [
  { header: 'ID заявления', field: 'applicationId' },
  { header: 'Дата', field: 'createdDate' },
  { header: 'Номер', field: 'conversionApplicationDto.docNum' },
  { header: 'Курс', field: 'conversionApplicationDto.clientCurrencyOfferRate' },
  { header: 'Сумма в валюте', field: 'conversionApplicationDto.senderAmount' },
  { header: 'Валюта', field: 'conversionApplicationDto.senderCurrency' },
  { header: 'Сумма в UZS', field: 'conversionApplicationDto.receiverAmount' },
  { header: 'Статус', field: 'applicationStatus' },
]

export const tableColumnsCurrencyBuyApplication = [
  { header: 'ID заявления', field: 'applicationId' },
  { header: 'Дата', field: 'createdDate' },
  { header: 'Номер', field: 'conversionApplicationDto.docNum' },
  { header: 'Курс', field: 'conversionApplicationDto.rate' },
  { header: 'Сумма в валюте', field: 'conversionApplicationDto.receiverAmount' },
  { header: 'Валюта', field: 'conversionApplicationDto.receiverCurrency' },
  { header: 'Сумма в UZS', field: 'conversionApplicationDto.senderAmount' },
  { header: 'Состояние в банке', field: 'applicationStatus' },
]

export const tableColumnsCrossConversion = [
  { header: 'ID заявления', field: 'applicationId', right: true },
  { header: 'Счет списания', field: 'conversionApplicationDto.sender', right: true },
  { header: 'Сумма продажи', field: 'conversionApplicationDto.senderAmount', right: true },
  { header: 'Счет зачисления', field: 'conversionApplicationDto.receiver', right: true },
  { header: 'Сумма продажи', field: 'conversionApplicationDto.receiverAmount', right: true },
  { header: 'Валюта', field: 'exchangeCurrency', left: true },
  { header: 'Состояние', field: 'applicationStatus' },
];
