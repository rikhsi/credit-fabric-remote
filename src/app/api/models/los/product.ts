import { TableDefaultFilter } from '../base';

export interface ProductFilter extends TableDefaultFilter {
  code: string;
  date_from: Date;
  date_to: Date;
  id: string;
  is_active: boolean;
  name: string;
  pk_record_id: string;
  search: string;
  sys_product_group_id: string;
  sys_product_type_id: string;
}

export interface ProductItem {
  cbs_code: string;
  cbs_id: string;
  changed_by_username: string;
  code: string;
  created: Date;
  date_from: Date;
  date_to: Date;
  default_dir_repayment_interval_id: string;
  dir_credit_purpose_extra_id: string;
  dir_foreign_financial_institution_id: string;
  dir_funding_source_id: string;
  dir_guarantee_type_id: string;
  dir_normative_legal_act_id: string;
  iabs_code: string;
  id: string;
  is_active: boolean;
  is_annuity: boolean;
  is_diff: boolean;
  is_gfpp_required: boolean;
  name: string;
  name_tx_id: string;
  rs_code: string;
  sys_product_group_id: string;
  sys_product_type_id: string;
  updated: Date;
}
