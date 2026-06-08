import { TableColumn } from '../../../../../shared/interfaces/table.interface';

export const eisvoTableColumns: TableColumn[] = [
  { header: 'ИДНК', field: 'idnc' },
  { header: 'Наименование контрактора', field: 'infos.1' },
  { header: 'Номер контракта', field: 'contractNumber' },
  { header: 'Дата контракта', field: 'contractDate' },
  { header: 'Наименование инопартнера', field: 'partner' },
];
