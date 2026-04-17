import { TableDefaultFilter } from '../base';

export interface CompanyActivityFilters extends TableDefaultFilter {
  id: string;
  name: string;
}

export interface CompanyActivityItem {
  id: string;
  name: string;
}
