import { TableDefaultFilter } from '../base';

export interface CityFilters extends TableDefaultFilter {
  id: string;
  name: string;
}

export interface CityItem {
  cbs_code: string;
  changed_by_username: string;
  created: Date;
  dir_region_id: string;
  id: string;
  is_active: boolean;
  name: string;
  name_tx_id: string;
  updated: Date;
}
