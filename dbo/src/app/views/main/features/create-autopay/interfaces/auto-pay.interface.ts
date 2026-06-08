export interface AutoPayForm {
  id?: number;
  name: string;
  paymentFrequency: 'MONTHLY' | 'WEEKLY';
  months: number[];
  days: number[];
  paymentDay: number;
  paymentTime: string;
  dateEnd: string;
  isAutoSend: boolean;
  withNotification: boolean;
  notificationBeforeTime: string;
}
