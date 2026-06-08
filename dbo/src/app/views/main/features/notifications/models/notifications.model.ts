export type NotificationsDto = {
  content: NotificationContent[]
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  pageable: pageable
}

export type NotificationContent = {
  id: number
  title: string
  shortDesc: string
  body: string
  createdAt: string
  status: string,
  image:string
}
export type pageable = {
  sort: {
    empty: boolean,
    unsorted: boolean,
    sorted: boolean
  },
  offset: number,
  pageNumber: number,
  pageSize: number,
  paged: boolean,
  unpaged: boolean

}

export type NotificationOne = {
  id: string
  title: string,
  description: string,
  shortDesc: string,
  link: string,
  createdAt: string,
  status: string
}
