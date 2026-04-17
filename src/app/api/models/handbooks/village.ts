import { TableDefaultFilter } from '../base';

export interface VillageFilter extends TableDefaultFilter {
  dir_city_id: string;
}

export interface VillageItem {
  changed_by_username: string;
  created: Date;
  dir_city_id: string;
  id: string;
  is_active: boolean;
  name: string;
  name_tx_id: string;
  updated: Date;
}
