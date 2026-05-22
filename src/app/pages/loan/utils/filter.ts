import { ProductItem } from '@api/models/los/product';
import { ENABLE_LOAN_IDS } from '@app/constants/loan';

export function filterEnableLoans(data: ProductItem[]): ProductItem[] {
  return data?.filter((item) => ENABLE_LOAN_IDS.includes(item.id.toLocaleLowerCase()));
}
