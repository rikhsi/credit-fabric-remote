export interface Pageable<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number; // current page number
  size: number; // page size
  last: boolean; // is last page
  first: boolean; // is first page
}
