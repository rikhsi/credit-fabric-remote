import { SelectOption } from '@app/typings/select';

export interface BranchFormData {
  filialCode: number | null;
  options: SelectOption[];
  isLoading?: boolean;
}
