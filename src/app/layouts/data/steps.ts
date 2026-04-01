import { LoanApplicationRoute, RootRoute } from '@constants';
import { StepItem } from '@typings';

export const STEPS: StepItem[] = [
  {
    link: `/${RootRoute.LoanApplication}/${LoanApplicationRoute.General}`,
  },
  {
    link: `/${RootRoute.LoanApplication}/${LoanApplicationRoute.Finance}`,
  },
];
