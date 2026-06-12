export enum Breakpoint {
  XS = '(max-width: 575.98px)',
  MOBILE = '(max-width: 767px)',
  TABLET = '(min-width: 768px) and (max-width: 1199px)',
  DESKTOP = '(min-width: 1200px)',
}

export const BREAKPOINT_LIST = [Breakpoint.MOBILE, Breakpoint.TABLET, Breakpoint.DESKTOP] as const;
