import { TableDefaultFilter } from '../base';

export interface SysMonthFilters extends TableDefaultFilter {
  id: string;
  name: string;
}

export interface SysMonthItem {
  id: string;
  name: string;
  code: string;
}
