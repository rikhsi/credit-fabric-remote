import { FlowExtraInformationForm } from '../models/form';
import { OnlineStartProcessingExtraInformation } from '@api/models/los/online';

export function mapFlowExtraInformationsToStartProcessing(items: FlowExtraInformationForm[]): OnlineStartProcessingExtraInformation[] {
  return items.map((item) => ({
    sectorEconomy: String(item.sectorEconomy),
    objectNewFormation: String(item.objectNewFormation),
    enterpriseClassfier: String(item.enterpriseClassifier),
    ecologicalImpactCode: String(item.ecologicalImpactCode),
  }));
}
