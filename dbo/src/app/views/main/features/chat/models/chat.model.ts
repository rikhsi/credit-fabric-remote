export interface FaqItems {
  title: string;
  isExpanded: boolean;
  description: string;
}
export interface ConnectResponse {
  content: string;
  errMessage: string | null;
  status: number;
}
export interface ChatMsgDto {
  content: any | null;
  created_at: Date;
  role: string;
  text: string;
  type: string;
  username: string;
}
export interface ChatSokcetResponse {
  last: boolean;
  messageList: ChatMsgDto[];
  room: {
    client_id: string;
    edit_at: Date;
    id: string;
    oper: string;
    oper_in: boolean;
    oper_msg: number;
    oper_msg_status: any | null;
    room_name: string;
    status: number;
    type: string;
    user_msg: number;
    user_msg_status: boolean;
  };
  start: boolean;
}

export enum ChatRolesEnum {
  BOT = "BOT",
  USER = "USER",
  OPERATOR = "OPERATOR",
}
