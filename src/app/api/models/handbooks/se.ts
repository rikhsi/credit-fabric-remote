import { TableDefaultFilter } from '../base';

export interface SeTypeFilter extends TableDefaultFilter {
  id: string;
  name: string;
}

export interface SeTypeItem {
  changed_by_username: string;
  code: string;
  created: Date;
  id: string;
  is_active: boolean;
  name: string;
  name_tx_id: string;
  updated: Date;
}
