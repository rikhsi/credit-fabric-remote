import { FlowExtraInformationForm, FlowFinanceForm, FlowForm } from '../models/form';
import {
  OnlineCreateApplicationPayload,
  OnlineFinData,
  OnlineStartProcessingExtraInformation,
  OnlineStartProcessingFinData,
} from '@api/models/los/online';

function toNumberOrNull(value: string | number | null | undefined): number | null {
  if (value == null || value === '') {
    return null;
  }

  const parsed = Number(String(value).replace(/\s/g, ''));

  return Number.isNaN(parsed) ? null : parsed;
}

function toStringOrNull(value: string | number | null | undefined): string | null {
  if (value == null || value === '') {
    return null;
  }

  return String(value);
}

export function mapFlowExtraInformationsToStartProcessing(items: FlowExtraInformationForm[]): OnlineStartProcessingExtraInformation[] {
  return items.map((item) => ({
    sectorEconomy: String(item.sectorEconomy),
    objectNewFormation: String(item.objectNewFormation),
    enterpriseClassfier: String(item.enterpriseClassifier),
    ecologicalImpactCode: String(item.ecologicalImpactCode),
  }));
}

export function mapFlowFinanceToStartProcessing(item: FlowFinanceForm): OnlineStartProcessingFinData {
  return {
    dirCompanyActivityId: toStringOrNull(item.companyActivity),
    activityTerm: toNumberOrNull(item.activityTerm),
    activityTermStr: toStringOrNull(item.activityTerm),
    sysMonth1Id: toStringOrNull(item.month1),
    sysMonth2Id: toStringOrNull(item.month2),
    sysMonth3Id: toStringOrNull(item.month3),
    month1Revenue: toNumberOrNull(item.month1Revenue),
    month1Income: toNumberOrNull(item.month1Income),
    month2Revenue: toNumberOrNull(item.month2Revenue),
    month2Income: toNumberOrNull(item.month2Income),
    month3Revenue: toNumberOrNull(item.month3Revenue),
    month3Income: toNumberOrNull(item.month3Income),
  };
}

export function mapFlowFinanceInformationsToStartProcessing(items: FlowFinanceForm[]): OnlineStartProcessingFinData[] {
  return items.map(mapFlowFinanceToStartProcessing);
}

export function mapFinDataToFlowForm(item: OnlineFinData): FlowFinanceForm {
  const companyActivity = toNumberOrNull(item.dirCompanyActivityId);

  return {
    companyActivity: companyActivity as number,
    activityTerm: item.activityTermStr ?? (item.activityTerm != null ? String(item.activityTerm) : null),
    month1: item.sysMonth1Id ?? null,
    month2: item.sysMonth2Id ?? null,
    month3: item.sysMonth3Id ?? null,
    month1Revenue: item.month1Revenue != null ? String(item.month1Revenue) : null,
    month1Income: item.month1Income != null ? String(item.month1Income) : null,
    month2Revenue: item.month2Revenue != null ? String(item.month2Revenue) : null,
    month2Income: item.month2Income != null ? String(item.month2Income) : null,
    month3Revenue: item.month3Revenue != null ? String(item.month3Revenue) : null,
    month3Income: item.month3Income != null ? String(item.month3Income) : null,
  };
}

export function buildStartProcessingPayload(form: FlowForm, applicationId: number): OnlineCreateApplicationPayload {
  return {
    accountNo: null,
    addresses: null,
    applicationId,
    cardNumber: null,
    docPersonalLegalNo: form.docPersonalLegalNo,
    email: form.email,
    employees: form.employees,
    extraInformations: mapFlowExtraInformationsToStartProcessing(form.extraInformations),
    finData: mapFlowFinanceInformationsToStartProcessing(form.financeInformations),
    legalForm: toStringOrNull(form.legalForm),
    name: form.name,
    newEmployees: form.newEmployees,
    oked: toStringOrNull(form.oked),
    ownershipCode: toStringOrNull(form.ownershipCode),
    registrationDate: form.registrationDate,
    registrationNumber: form.registrationNumber,
    registrationPlaceCode: form.registrationPlaceCode,
    workPhone: form.workPhone,
  };
}
