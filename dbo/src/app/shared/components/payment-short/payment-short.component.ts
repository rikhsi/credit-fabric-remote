import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgClass, NgIf, NgOptimizedImage } from '@angular/common';
import { NgxMaskPipe } from 'ngx-mask';

@Component({
    selector: 'app-payment-short',
    imports: [
        NgClass,
        NgxMaskPipe,
        NgOptimizedImage,
        NgIf
    ],
    templateUrl: './payment-short.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentShortComponent {
  @Input() transaction!: any;
  successResponses = ['success', 'проведен'];
  errorResponses = ['error', 'cancel', 'ошибка', 'ошибки'];

  getStatusLogoName(transaction: any): string {
    const status = transaction.absStatus || transaction.status;
    const isSuccess = this.successResponses.includes(status.toLowerCase().trim());
    const isError = this.errorResponses.includes(status.toLowerCase().trim());
    if(isSuccess) {
      return 'success';
    } else if (isError) {
      return 'cancel';
    } else {
      return 'pending'
    }
  }
}
