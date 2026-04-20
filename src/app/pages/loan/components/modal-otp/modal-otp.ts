import { ChangeDetectionStrategy, Component, inject, linkedSignal, signal } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { delay, map, of } from 'rxjs';
import { FormField } from '@angular/forms/signals';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { LoanDetailService } from '@pages/loan/services';
import { OtpModalData } from '@pages/loan/models';
import { PhoneNumberPipe } from '@shared/pipes';
import { InputOtp } from '@shared/components';

@Component({
  selector: 'cf-modal-otp',
  imports: [
    NzButtonComponent,
    NzIconDirective,
    TranslocoDirective,
    InputOtp,
    NzTypographyComponent,
    TranslocoDirective,
    FormField,
    PhoneNumberPipe,
  ],
  templateUrl: './modal-otp.html',
  styleUrl: './modal-otp.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalOtp {
  private readonly nmRef = inject(NzModalRef<OtpModalData>);
  private readonly ldService = inject(LoanDetailService);
  public readonly modalData = inject<OtpModalData>(NZ_MODAL_DATA);

  public readonly form = linkedSignal(() => this.ldService.otpForm);
  public readonly isLoading = signal<boolean>(false);

  clearOtpError(): void {
    this.ldService.otpError.set(false);
  }

  close(): void {
    this.nmRef.close(false);
  }

  submit(): void {
    this.isLoading.set(true);

    of(this.form().code().value())
      .pipe(
        delay(2000),
        map((value) => value === '111111'),
      )
      .subscribe((state) => {
        if (state) {
          this.nmRef.close(true);
        } else {
          this.ldService.otpError.set(true);
        }

        this.isLoading.set(false);
      });
  }
}
