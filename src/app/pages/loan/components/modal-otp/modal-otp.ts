import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, OnInit, signal } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { delay, map, of } from 'rxjs';
import { FormField } from '@angular/forms/signals';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { LoanDetailService } from '@pages/loan/services';
import { OtpModalData } from '@pages/loan/models';
import { PhoneNumberPipe, SecondsToTimePipe } from '@shared/pipes';
import { InputOtp } from '@shared/components';
import { TimerService } from '@shared/services';

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
  ],
  templateUrl: './modal-otp.html',
  styleUrl: './modal-otp.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TimerService],
})
export class ModalOtp implements OnInit {
  private readonly nmRef = inject(NzModalRef<OtpModalData>);
  private readonly ldService = inject(LoanDetailService);
  private readonly timerService = inject(TimerService);
  public readonly modalData = inject<OtpModalData>(NZ_MODAL_DATA);

  public readonly form = linkedSignal(() => this.ldService.otpForm);
  public readonly isLoading = signal<boolean>(false);

  public readonly leftTime = computed(() => this.timerService.leftTime());
  public readonly running = computed(() => this.timerService.running());

  ngOnInit(): void {
    this.timerService.start();
  }

  clearOtpError(): void {
    this.ldService.otpError.set(false);
  }

  close(): void {
    this.nmRef.close(false);
  }

  resendOtp(): void {
    this.timerService.start();
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
