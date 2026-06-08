import {pageable} from "../../accounts-payments/models/accounts-payments.model";

export type UsersDto = {
  content: UsersContent[];
  totalElements: number
  totalPages: number
  pageable: pageable
}
export type SignOrderResponse = {
  id: number
  name: string
  code: string
  mode:string
  order: any;
}

export type UsersContent = {
  id: number
  email: string
  firstname: string
  lastname: string
  avatar: string
  inn: string
  pnfl: string
  asSerialNumber: string
  status: string
  passwordChange: true
  username: string
  roleName: string
  roleType: string
}

export type permitUserArray = {
  userId:number
  id:number
  accountNumber:string
}
