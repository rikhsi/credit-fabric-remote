import { translate } from '@jsverse/transloco';
import { ToastService } from '@core/services/toast.service';

/** Shown after a successful start-processing call, once the user lands on "My applications". */
export function showApplicationSuccessToast(toast: ToastService): void {
  toast.success(translate('toast.application_success.title'), translate('toast.application_success.description'));
}

/** Shown when start-processing (or the OneID check before it) fails. */
export function showApplicationErrorToast(toast: ToastService): void {
  toast.error(translate('toast.service_unavailable.title'), translate('toast.service_unavailable.description'));
}
