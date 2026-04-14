export interface TableColumn {
  db_column_type: string;
  fk_generic_entity__id: string;
  generic_screen_link_id: string;
  generic_screen_url: string;
  hb_generic_entity__db_table_type: string;
  hb_generic_entity__id: string;
  hb_generic_entity__is_cached: boolean;
  hb_generic_entity__is_handbook: boolean;
  hb_generic_entity__name: string;
  hb_generic_entity__sys_module_id: string;
  is_default_label: boolean;
  is_primary_key: boolean;
  is_show_in_excel_export: boolean;
  is_show_in_excel_import: boolean;
  is_show_in_table: boolean;
  is_show_in_table_filter: boolean;
  is_show_in_table_nowrap: boolean;
  is_show_link_in_dialog: boolean;
  is_show_link_in_new_tab: boolean;
  label: string;
  name: string;
}

export interface TableEntity {
  _status: string;
  db_table_name: string;
  db_table_type: string;
  id: string;
  is_cached: boolean;
  is_folder: boolean;
  is_handbook: boolean;
  label: string;
  label_tx_id: string;
  name: string;
  order_num: number;
  parent_id: string;
  sys_module_id: string;
  sys_permission_id: string;
}

export interface TableOverview<T> {
  columns?: TableColumn[];
  data: T[];
  entity?: TableEntity;
}

export interface PaginationFilter {
  limit: number;
  page: number;
}

export interface TableDefaultFilter extends PaginationFilter {
  search?: string;
  [key: string]: unknown;
}
