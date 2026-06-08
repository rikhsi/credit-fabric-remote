import { TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MAT_DIALOG_DEFAULT_OPTIONS, MatDialogConfig } from '@angular/material/dialog';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { ToastComponent } from '../components/toast/toast.component';

export const TranslateConfigConst = {
  loader: {
    provide: TranslateLoader,
    useFactory: HttpLoaderFactory,
    deps: [HttpClient],
  },
  defaultLanguage: 'ru',
};

function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
const iconClasses = {
  error: 'toast-error',
  info: 'toast-info',
  success: 'toast-success',
  warning: 'toast-warning',
};
export const ToastrConfigConst = {
  closeButton: true,
  positionClass: 'toast-top-right',
  newestOnTop: true,
  iconClasses,
  extendedTimeOut: 5000,
  resetTimeoutOnDuplicate: true,
  toastComponent: ToastComponent,
};

export const DialogConfigConst = {
  provide: MAT_DIALOG_DEFAULT_OPTIONS,
  useValue: {
    ...new MatDialogConfig(),
    disableClose: true,
    autoFocus: false,
    scrollStrategy: new NoopScrollStrategy(),
    panelClass: 'card-dialog-rounded-2-5',
  },
};
