import { TableDefaultFilter } from '../base';

export interface CountryFilters extends TableDefaultFilter {
  cbu_code: string;
  id: string;
  name: string;
}

export interface CountryItem {
  cbu_code: string;
  changed_by_username: string;
  code: string;
  created: Date;
  id: string;
  is_active: boolean;
  name: string;
  name_tx_id: string;
  order_num: number;
  three_char_value: string;
  two_char_value: string;
  updated: Date;
}
