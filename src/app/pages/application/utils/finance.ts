import { OnlineStartProcessingFinData } from '@api/models/los/online';

export function isFlowFinanceFilled(item: OnlineStartProcessingFinData | null | undefined): boolean {
  if (!item) {
    return false;
  }

  return (
    item.dirCompanyActivityId != null &&
    !!item.activityTerm &&
    !!item.sysMonth1Id &&
    !!item.month1Revenue &&
    !!item.month1Income &&
    !!item.sysMonth2Id &&
    !!item.month2Revenue &&
    !!item.month2Income &&
    !!item.sysMonth3Id &&
    !!item.month3Revenue &&
    !!item.month3Income
  );
}
