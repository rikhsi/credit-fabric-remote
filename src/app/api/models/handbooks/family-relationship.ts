import { TableDefaultFilter } from '../base';

export type FamilyRelationshipFilters = TableDefaultFilter;

export interface FamilyRelationshipItem {
  id: string;
  name: string;
  is_active?: boolean;
}
