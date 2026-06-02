import { FlowFinanceForm } from '../models/form';

export function isFlowFinanceFilled(item: FlowFinanceForm): boolean {
  return (
    item.companyActivity != null &&
    !!item.activityTerm &&
    !!item.month1 &&
    !!item.month1Revenue &&
    !!item.month1Income &&
    !!item.month2 &&
    !!item.month2Revenue &&
    !!item.month2Income &&
    !!item.month3 &&
    !!item.month3Revenue &&
    !!item.month3Income
  );
}
