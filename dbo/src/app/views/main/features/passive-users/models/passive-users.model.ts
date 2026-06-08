import {pageable} from "../../accounts-payments/models/accounts-payments.model";

export type PassiveUserDto = {
  content: PassiveUserContent[];
  totalElements: number
  totalPages: number
  pageable: pageable
}

export type PassiveUserContent = {
  phoneNumber:string
  id:string
  username:string
}
