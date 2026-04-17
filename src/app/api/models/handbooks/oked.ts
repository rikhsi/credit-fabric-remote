import { TableDefaultFilter } from '../base';

export interface OkedFilter extends TableDefaultFilter {
  id: string;
  name: string;
}

export interface OkedItem {
  changed_by_username: string;
  created: Date;
  eco_class: string;
  group_code: string;
  id: string;
  is_active: boolean;
  name: string;
  name_tx_id: string;
  net_margin_ip: number;
  net_margin_ul: number;
  oked: string;
  part_code: string;
  section_code: string;
  updated: Date;
}
