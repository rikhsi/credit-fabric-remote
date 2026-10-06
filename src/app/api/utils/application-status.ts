import {
  ApplicationStatus,
  OnlineApplication,
  OnlineApplicationProduct,
  OnlineOffer,
  OnlineOfferDto,
  OnlineOffersResponse,
} from '@api/models/los/application';

const APPLICATION_STATUSES = new Set<string>(Object.values(ApplicationStatus));

export function normalizeApplicationStatus(value: unknown): ApplicationStatus | null {
  if (value == null || value === '') {
    return null;
  }

  if (typeof value === 'object') {
    const item = value as Record<string, unknown>;

    return normalizeApplicationStatus(item['id'] ?? item['sysStatusId'] ?? item['value']);
  }

  const normalized = String(value)
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');

  return APPLICATION_STATUSES.has(normalized) ? (normalized as ApplicationStatus) : null;
}

export function pickApplicationStatus(...candidates: unknown[]): ApplicationStatus | null {
  for (const candidate of candidates) {
    const status = normalizeApplicationStatus(candidate);

    if (status) {
      return status;
    }
  }

  return null;
}

export function resolveApplicationProduct(application: OnlineApplication | null | undefined): OnlineApplicationProduct | null {
  if (!application) {
    return null;
  }

  if (application.product?.loanAmount != null) {
    return application.product;
  }

  const raw = application as OnlineApplication & {
    loanAmount?: number;
    loanRate?: number;
    loanTerm?: number;
    monthlyPayment?: number;
    paymentType?: string;
    productName?: string;
    rate?: number;
  };

  if (raw.loanAmount == null) {
    return null;
  }

  return {
    loanAmount: raw.loanAmount,
    loanRate: raw.loanRate ?? raw.rate ?? 0,
    loanTerm: raw.loanTerm ?? 0,
    monthlyPayment: raw.monthlyPayment ?? 0,
    paymentType: raw.paymentType ?? '',
    product: raw.productName ?? '',
  };
}

export function normalizeOnlineApplication(application: OnlineApplication): OnlineApplication {
  const raw = application as OnlineApplication & Record<string, unknown>;

  return {
    ...application,
    sysStatusId:
      pickApplicationStatus(application.sysStatusId, raw['sys_status_id'], raw['status'], raw['statusId']) ?? application.sysStatusId,
    product: resolveApplicationProduct(application) ?? application.product,
  };
}

export function normalizeOnlineOffer(
  raw: OnlineOffer | OnlineOfferDto | Record<string, unknown>,
  defaults?: Pick<OnlineOffer, 'paymentType' | 'loanAmount'>,
): OnlineOffer {
  const item = raw as OnlineOfferDto & OnlineOffer & Record<string, unknown>;

  return {
    offerId: String(item.offerId ?? ''),
    product: String(item.product ?? item.productId ?? ''),
    loanAmount: Number(item.loanAmount ?? item.maxLoanAmount ?? defaults?.loanAmount ?? 0),
    loanRate: Number(item.loanRate ?? item.interestRate ?? 0),
    loanTerm: Number(item.loanTerm ?? 0),
    paymentType: String(item.paymentType || defaults?.paymentType || ''),
    ...(item.issueDate != null ? { issueDate: String(item.issueDate) } : {}),
  };
}

/** Accepts either a raw array or `{ offers: [...] }` from the backend. */
export function normalizeOnlineOffers(
  response: OnlineOffer[] | OnlineOffersResponse | OnlineOfferDto[] | null | undefined,
  defaults?: Pick<OnlineOffer, 'paymentType' | 'loanAmount'>,
): OnlineOffer[] {
  const list = Array.isArray(response)
    ? response
    : Array.isArray(response?.offers)
      ? response.offers
      : [];

  return list.map((item) => normalizeOnlineOffer(item, defaults)).filter((offer) => !!offer.offerId);
}
