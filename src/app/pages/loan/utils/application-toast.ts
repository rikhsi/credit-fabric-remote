import { HttpErrorResponse } from '@angular/common/http';
import { translate } from '@jsverse/transloco';
import { ToastService } from '@core/services/toast.service';

/** Shown after a successful start-processing call, once the user lands on "My applications". */
export function showApplicationSuccessToast(toast: ToastService): void {
  toast.success(translate('toast.application_success.title'), translate('toast.application_success.description'));
}

/**
 * Shown when start-processing fails.
 * HTTP 409 means the client already has an unfinished application (same contract as the old short-application-create).
 */
export function showApplicationErrorToast(toast: ToastService, error?: unknown): void {
  if (error instanceof HttpErrorResponse && error.status === 409) {
    toast.error(
      translate('modal.error_not_finished_application.title'),
      translate('modal.error_not_finished_application.description'),
    );
    return;
  }

  toast.error(translate('toast.service_unavailable.title'), translate('toast.service_unavailable.description'));
}
