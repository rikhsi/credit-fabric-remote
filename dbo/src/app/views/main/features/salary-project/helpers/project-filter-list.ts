import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ProjectFilterList {
  residence_filter = [
    {
      title: 'Все',
      id: 'residence-all',
    },
    {
      title: 'Резидент',
      id: 'resident',
    },
    {
      title: 'Нерезидент',
      id: 'non-resident',
    },
  ]
  position_filter = [
    {
      title: 'Все',
      id: 'all-positions',
    },
    {
      title: 'Директор',
      id: 'director',
    },
    {
      title: 'Директор',
      id: 'director',
    },
    {
      title: 'Директор',
      id: 'director',
    },
    {
      title: 'Директор',
      id: 'director',
    },
    {
      title: 'Директор',
      id: 'director',
    },
    {
      title: 'Директор',
      id: 'director',
    },
    {
      title: 'Директор',
      id: 'director',
    },
    {
      title: 'Директор',
      id: 'director',
    },
  ]
  employee_status_filter = [
    {
      title: 'Все',
      id: 'all-employees',
    },
    {
      title: 'Активные',
      id: 'active',
    },
    {
      title: 'Неактивные',
      id: 'inactive',
    },
  ]


  repayment_type_filter = [
    {
      title: 'Все',
      id: 'all',
    },
    {
      title: 'Созданные',
      id: 'created',
    },
    {
      title: 'Отправленные',
      id: 'sent',
    },
    {
      title: 'Исполненные',
      id: 'completed',
    },
    {
      title: 'Отклонённые',
      id: 'rejected',
    },
    {
      title: 'С ошибками',
      id: 'with-error',
    },
  ];
  repayment_status_filter = [
    {
      title: 'Все',
      id: 'all-statuses',
    },
    {
      title: 'Создан',
      id: 'created-statuses',
    },
    {
      title: 'Частично подписан',
      id: 'partially-signed',
    },
    {
      title: 'Подписан',
      id: 'signed',
    },
    {
      title: 'Импортирован',
      id: 'imported',
    },
    {
      title: 'Ошибка контроля',
      id: 'control-error',
    },
    {
      title: 'Доставлен',
      id: 'delivered',
    },
    {
      title: 'Выгружен',
      id: 'unloaded',
    },
    {
      title: 'Ошибка экспорта',
      id: 'export-error',
    },
    {
      title: 'Принят АБС',
      id: 'abs-accepted',
    },
    {
      title: 'Принят',
      id: 'accepted',
    },
    {
      title: 'Ожидает распоряжения',
      id: 'awaiting-orders',
    },
    {
      title: 'Исполнен',
      id: 'completed-statuses',
    },
    {
      title: 'Частично исполнен',
      id: 'partially-fulfilled',
    },
    {
      title: 'Ошибка реквизитов',
      id: 'details-error',
    },
    {
      title: 'ЭП/АСП неверна',
      id: 'EP_ASP-incorrect',
    },
    {
      title: 'Отказан АБС',
      id: 'abs-refused',
    },
    {
      title: 'Отвергнут банком',
      id: 'bank-rejected',
    },
    {
      title: 'Отозван банком',
      id: 'bank-revoked',
    },
    {
      title: 'Отозван',
      id: 'withdrawn-status',
    },
    {
      title: 'Ошибка ЭП СБК',
      id: 'SBK_EP-error',
    },
    {
      title: 'Ошибка КЭП',
      id: 'KEP-error',
    },
    {
      title: 'Требуется подтверждение СМС-паролем',
      id: 'otp-required',
    },
    {
      title: 'Отказан контролирующей организацией',
      id: 'controlling_org-refused',
    },
  ];

}
