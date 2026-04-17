import { TableDefaultFilter } from '../base';

export interface AddressTypeFilter extends TableDefaultFilter {
  changed_by_username: string;
  id: string;
  name: string;
  pk_record_id: string;
  sys_individual_legal_entity_id: string;
}

export interface AddressTypeItem {
  changed_by_username: string;
  created: Date;
  id: string;
  is_active: boolean;
  name: string;
  name_tx_id: string;
  updated: Date;
}
