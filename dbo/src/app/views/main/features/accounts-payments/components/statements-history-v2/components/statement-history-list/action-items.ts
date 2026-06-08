import { ICONS_TYPE } from "src/app/shared/types";

export interface ActionItem {
  title: string;
  icon: ICONS_TYPE;
  action: ActionType
}
export type ActionType = 'REFRESH' | 'SHARE' | 'SHARE_EMAIL' | 'DELETE'

export const ACTION_ITEMS_OF_STATEMENT_HISTORY: ActionItem[] = [
  {
    title: 'new.repeat',
    icon: 'hamkor_refresh',
    action: 'REFRESH'
  },
  {
    title: 'accountStatements.share',
    icon: 'hamkor_share',
    action: 'SHARE'
  }, {
    title: 'accountStatements.send_to_email',
    icon: 'hamkor_mail',
    action: 'SHARE_EMAIL'
  }, {
    title: 'accountStatements.delete',
    icon: 'hamkor_delete',
    action: 'DELETE'
  },

]
