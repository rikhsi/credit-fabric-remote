export type MenuList = {
  title: string;
  icon: string;
  link?: string;
  titleKey:string
  list?: MenuListItem[];
  disabled?: boolean;
  permissions?: string[];
};

export type MenuListItem = {
  title: string;
  icon: string;
  link: string;
  titleKey:string
};
export type NewMenuList = {
  title: string;
  icon?: string;
  link?: string;
  titleKey:string;
  list?: NewMenuListItem[];
  disabled?: boolean;
  permissions?: string[];
  isHeader?: boolean;
  subMenuList?: NewMenuList[];
};

export type NewMenuListItem = {
  title: string;
  icon: string;
  link: string;
  titleKey:string
};
