import { TableDefaultFilter } from '../base';

export interface CreditPurposeFilters extends TableDefaultFilter {
  id: string;
  name: string;
}

export interface CreditPurposeItem {
  id: string;
  name: string;
  code: string;
  cbs_code: string;
  is_active: boolean;
  is_suspicious: boolean;
}
