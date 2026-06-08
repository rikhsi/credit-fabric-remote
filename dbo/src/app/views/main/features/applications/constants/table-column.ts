import { TableColumn } from '../../../../../shared/interfaces/table.interface';

export const ApplicationTableColumn: TableColumn[] = [
  {
    header: 'ID Заявления', field: 'applicationId',
  },
  {
    header: 'Тип', field: 'type',
  },
  {
    header: 'Дата создания' , field: 'createdDate',
  },
  {
    header: 'Статус', field: 'applicationStatus',
  },
]
