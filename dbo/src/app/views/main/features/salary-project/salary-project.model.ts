import {pageable} from "../accounts-payments/models/accounts-payments.model";

export type EmployeeListDto = {
  content: EmployeeContent[]
  empty: boolean
  first: boolean
  last: boolean
  number: number
  numberOfElements: number
  pageable: pageable
  size: number
  sort:
    { empty: boolean
      unsorted: boolean
      sorted: boolean }
  totalElements: number
  totalPages: number
}
export type EmployeeContent = {
  employeeId: number
  employeeName: string
  cardAccount: string
  maskedPan: string
  businessId: number
  cardType: string
  employeeStatus: string
  passportNumber:string
  passportSerial:string
  phoneNumber:string
  birthday: string
  cardPan: null
  businessAccount: string
}
