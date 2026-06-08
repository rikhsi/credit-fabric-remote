export enum StatusCode  {
  ACTIVE = 'ACTIVE',
  PARTIAL_CLOSED = "PARTIAL_CLOSED",
  DELETED = 'DELETED',
  UNKNOWN = 'UNKNOWN',

}

export interface StatusListMap extends Record<StatusCode, string> {
  [StatusCode.ACTIVE]: string;
  [StatusCode.PARTIAL_CLOSED]: string;
  [StatusCode.DELETED]: string;
  [StatusCode.UNKNOWN]: string;
} 

export interface StatusListResponseData {
  statusList: StatusListMap;
}



export const statusListToMap = [
  { name: "Активный", value: "ACTIVE", img: "./assets/new-icons/planned-status.svg" },
  { name: "Частично исполнен", value: "PARTIAL_CLOSED", img: "./assets/new-icons/partially-status.svg" },
  { name: "Исполнен", value: "DELETED", img: "./assets/new-icons/enrolled-status.svg" },
]