export interface UserModule {
  id: string;
  name: string;
  selected: boolean;
  url: string;
}

export interface UserItem {
  changed_by_username: string;
  created: Date;
  deactivated: Date;
  deactivated_by_username: string;
  default_lang: string;
  default_theme: string;
  email: string;
  first_name: string;
  id: string;
  is_active: boolean;
  is_email_verified: boolean;
  is_system: boolean;
  job_title: string;
  last_name: string;
  modules: UserModule[];
  password: string;
  picture: string;
  selected: boolean;
  updated: Date;
}
