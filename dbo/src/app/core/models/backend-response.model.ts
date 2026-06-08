export interface BackendResponse<T> {
  timestamp: number;
  success: boolean;
  result: {
    actionType: string,
    code?: number;
    message: string | string[];
    audit: string;
    data: T;
  };
  error?: {
    message: string;
  }
  code?: number;
}


export type NotificationDto = {
  from: number
  messageId: string
  notification: {
  title: string
    body: string
    image: string
}
  data: {
  notifyId: string
    sound: string
    notifyType: string
    image:string
    messageCount: number
    qrUrl: string
    id: number
    shortBody: string
    title: string
}
}

export type Balance = {
  amount:number
  scale: number
  currency: string
}

export interface  BalanceResponse {
  totalAmount: Balance
}
