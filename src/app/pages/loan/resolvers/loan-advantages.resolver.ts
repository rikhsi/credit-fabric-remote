import { ResolveFn } from '@angular/router';
import { LOAN_FLOW_ADVANTAGES_LIST } from '../data';
import { LoanAdvantageItem } from '../models';
import { ApplicationRoute } from '@app/constants/route-path';

export const loanAdvantagesResolver: ResolveFn<LoanAdvantageItem[]> = ({ params: { loanId } }) => {
  switch (loanId) {
    case ApplicationRoute.Flow:
      return LOAN_FLOW_ADVANTAGES_LIST;
    default:
      return [];
  }
};
