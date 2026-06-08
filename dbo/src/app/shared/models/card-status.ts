import { IconName } from '../ui/icon/icon.component';

export const cardStatuses = [
  'ACTIVE',
  'BLOCKED',
  'EXPIRED',
] as const;

export type CardStatus = (typeof cardStatuses)[number];

type CardStatusIcon = {
  icon: IconName;
  svgClass: string;
  label: string;
};

export const cardStatusIcons: Record<CardStatus, CardStatusIcon> = {
  ACTIVE: {
    icon: 'successCircle',
    svgClass: 'fill-[#1fc16b]',
    label: 'accounts.active',
  },
  BLOCKED: {
    icon: 'lockCircle',
    svgClass: 'fill-[#fb3748]',
    label: 'accounts.blocked',
  },
  EXPIRED: {
    icon: 'alertCircleBold',
    svgClass: 'fill-[#fb3748]',
    label: 'salaryStatements.expired',
  },
};
