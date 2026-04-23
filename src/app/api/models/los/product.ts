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

export interface ProductConditionFilter extends Partial<TableDefaultFilter> {
  dir_segment_id?: string;
  fk_entity_id?: string;
  fk_record_id?: string;
  pk_record_id?: string;
  sys_risk_grade_id?: string;
}

export interface ProductConditionItem {
  changed_by_username: string;
  created: Date;
  default_amount: number;
  default_term: number;
  dir_currency_id: string;
  dir_segment_id: string;
  edit_label: string;
  grace_period: number;
  id: string;
  interest_rate: number;
  is_active: boolean;
  is_default: boolean;
  max_amount: number;
  max_term: number;
  min_amount: number;
  min_term: number;
  product_id: string;
  slider_step: number;
  sys_rate_type_id: string;
  sys_risk_grade_id: string;
  sys_term_type_id: string;
  updated: Date;
}
