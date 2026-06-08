import { IconName } from '../ui/icon/icon.component';

export const PAYMENT_STATUSES = ['PREPARE', 'AUTO_PAY', 'IN_PROCESS', 'SUCCESS', 'PARTIAL_SUCCESS', 'ERROR', 'CANCEL', 'DELETE'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_META: Record<PaymentStatus, { icon: IconName; i18n: string; svgClass: string }> = {
  PREPARE: { icon: 'prepareCircle', i18n: 'loans.for_signature', svgClass: 'fill-[#7D52F4]' },
  AUTO_PAY: { icon: 'prepareCircle', i18n: 'loans.for_signature', svgClass: 'fill-[#7D52F4]' },
  IN_PROCESS: { icon: 'inProcessCircle', i18n: 'salaryStatements.in_progress', svgClass: 'fill-[#FA7319]' },
  SUCCESS: { icon: 'successCircle', i18n: 'salaryStatements.executed', svgClass: 'fill-[#1FC16B]' },
  PARTIAL_SUCCESS: { icon: 'successCircle', i18n: 'salaryStatements.partially_executed', svgClass: 'fill-[#FA7319]' },
  ERROR: { icon: 'errorCircle', i18n: 'accountStatements.error', svgClass: 'fill-[#FB3748]' },
  CANCEL: { icon: 'xCircle', i18n: 'myAccounts.canceled', svgClass: 'fill-[#A3A3A3]' },
  DELETE: { icon: 'xCircle', i18n: 'salaryStatements.deleted', svgClass: 'fill-[#A3A3A3]' },
};
