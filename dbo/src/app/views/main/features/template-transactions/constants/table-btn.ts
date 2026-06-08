import { TableButton } from '../../../../../shared/interfaces/table-button.interface';

export const TemplateTableActionBtns: TableButton[] = [
  {
    id: 'edit',
    title: 'Редактировать',
    src: './assets/svg/pencil.svg',
    active: false,
    activeColor: '!text-[#000000] cursor-pointer',
  },
  {
    id: 'delete',
    title: 'Удалить',
    src: './assets/svg/trash.svg',
    active: false,
    activeColor: '!text-[#000000] cursor-pointer',
  },

];
