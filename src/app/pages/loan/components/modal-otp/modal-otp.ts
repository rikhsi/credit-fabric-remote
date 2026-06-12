import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { disabled, form, FormField, maxLength, minLength, required, validate } from '@angular/forms/signals';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { OtpModalData } from '@pages/loan/models';
import { PhoneNumberPipe, SecondsToTimePipe } from '@shared/pipes';
import { InputOtp } from '@shared/components';
import { TimerService } from '@shared/services';
import { OnlineApiService } from '@api/controllers/los';
import { otpFormModel } from '@pages/loan/data';
import { BounceDirective } from '@shared/directives';

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
    SecondsToTimePipe,
    PhoneNumberPipe,
    BounceDirective,
  ],
  templateUrl: './modal-otp.html',
  styleUrl: './modal-otp.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TimerService],
})
export class ModalOtp implements OnInit {
  private readonly nmRef = inject(NzModalRef<OtpModalData>);
  private readonly timerService = inject(TimerService);
  public readonly modalData = inject<OtpModalData>(NZ_MODAL_DATA);
  private readonly onlineApiService = inject(OnlineApiService);
  private readonly destroyRef = inject(DestroyRef);
  private notification = inject(NzNotificationService);

  public readonly form = form(signal(otpFormModel), (schemaPath) => {
    required(schemaPath.code);
    minLength(schemaPath.code, 6);
    maxLength(schemaPath.code, 6);
    validate(schemaPath.code, () => (this.otpError() ? { kind: 'invalidOtp' } : null));
    disabled(schemaPath.code, () => this.isLoading());
  });

  public readonly isLoading = signal<boolean>(false);
  public readonly otpError = signal(false);

  public readonly leftTime = computed(() => this.timerService.leftTime());
  public readonly running = computed(() => this.timerService.running());

  ngOnInit(): void {
    this.timerService.start();
    this.resendOtp();
  }

  clearOtpError(): void {
    this.otpError.set(false);
  }

  close(): void {
    this.nmRef.close(false);
  }

  resendOtp(): void {
    this.isLoading.set(true);

    this.onlineApiService
      .sendOtp$({
        pinfl: this.modalData.pinfl,
        phoneNumber: this.modalData.phoneNumber,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (state) => {
          this.timerService.start();
          this.isLoading.set(false);

          if (!state.isOtpSent) {
            this.notification.error(state.errorCode, '');
          }
        },
      });
  }

  submit(): void {
    this.isLoading.set(true);

    this.onlineApiService
      .checkOtp$({
        pinfl: this.modalData.pinfl,
        phoneNumber: this.modalData.phoneNumber,
        otpCode: this.form.code().value(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => {
        if (state.isOtpValidated) {
          this.nmRef.close(true);
        } else {
          this.otpError.set(true);

          this.notification.error(state.errorCode, '');
        }

        this.isLoading.set(false);
      });
  }
}
