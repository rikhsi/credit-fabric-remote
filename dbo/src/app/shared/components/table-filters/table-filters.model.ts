import { SafeHtml } from "@angular/platform-browser";
import { endOfDay, startOfDay } from '../../lib/date.utils';
import { IconName } from '../../ui/icon/icon.component';

export interface FilterConfig {
  name: string;
  type: 'search' | 'select' | 'period' | 'amount' | 'multiSelect';
  placeholder: string;
  options?: FilterOption[];
  hide?: boolean;
  hideDialog?: boolean;
}

export interface FilterOption {
  label: string;
  value: string;
  icon?: SafeHtml;
  iconName?: IconName;
  svgClass?: string;
}

export const defaultPeriods = {
  today: {
    start: startOfDay(new Date()),
    end: endOfDay(new Date()),
  },
  yesterday: {
    start: startOfDay(new Date(new Date().setDate(new Date().getDate() -1))),
    end: endOfDay(new Date(new Date().setDate(new Date().getDate() -1))),
  },
  week: {
    start: startOfDay(new Date(new Date().setDate(new Date().getDate() - 6))),
    end: endOfDay(new Date()),
  },
  month: {
    start: startOfDay(new Date(new Date().setMonth(new Date().getMonth() - 1))),
    end: endOfDay(new Date()),
  }
};
