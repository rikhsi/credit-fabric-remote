import { TableDefaultFilter } from '../base';

export interface BranchFilters extends TableDefaultFilter {
  id: string;
  name: string;
}

export interface BranchItem {
  id: string;
  name: string;
  name_tx_id: string;
  name_head: string;
  name_head_tx_id: string;
  created: string;
  updated: string | null;
  changed_by_username: string | null;
  is_active: boolean;
  code: string;
  dir_city_id: string;
  cbs_code: number;
}
