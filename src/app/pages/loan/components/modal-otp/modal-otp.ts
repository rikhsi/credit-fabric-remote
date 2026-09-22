import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
  output,
  signal,
  untracked,
  ViewChild,
} from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { disabled, form, FormField, maxLength, minLength, required, validate } from '@angular/forms/signals';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { OtpModalData } from '@pages/loan/models';
import { PhoneNumberPipe, SecondsToTimePipe } from '@shared/pipes';
import { InputOtp } from '@shared/components';
import { TimerService } from '@shared/services';
import { OnlineApiService } from '@api/controllers/los';
import { otpFormModel } from '@pages/loan/data';
import { BounceDirective } from '@shared/directives';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'cf-modal-otp',
  imports: [
    NzButtonComponent,
    NzIconDirective,
    TranslocoDirective,
    InputOtp,
    NzTypographyComponent,
    FormField,
    SecondsToTimePipe,
    PhoneNumberPipe,
    BounceDirective,
  ],
  templateUrl: './modal-otp.html',
  styleUrl: './modal-otp.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TimerService],
  host: {
    '[class.inline]': 'inline()',
  },
})
export class ModalOtp implements OnInit {
  private readonly nmRef = inject(NzModalRef<OtpModalData>, { optional: true });
  private readonly injectedData = inject<OtpModalData | null>(NZ_MODAL_DATA, { optional: true });
  private readonly timerService = inject(TimerService);
  private readonly onlineApiService = inject(OnlineApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(ToastService);

  readonly inline = input(false);
  readonly data = input<OtpModalData | null>(null);

  readonly confirmed = output<boolean>();

  @ViewChild(InputOtp) private inputOtp?: InputOtp;

  readonly modalData = computed(() => this.data() ?? this.injectedData!);

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

  constructor() {
    effect(() => {
      this.form.code().value();

      untracked(() => {
        if (this.otpError()) {
          this.otpError.set(false);
        }
      });
    });
  }

  ngOnInit(): void {
    this.timerService.start();
    this.resendOtp();
  }

  close(): void {
    if (this.inline()) {
      this.confirmed.emit(false);
      return;
    }

    this.nmRef?.close(false);
  }

  resendOtp(): void {
    const data = this.modalData();

    if (!data) {
      return;
    }

    this.isLoading.set(true);

    this.onlineApiService
      .sendOtp$({
        pinfl: data.pinfl,
        phoneNumber: data.phoneNumber,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (state) => {
          this.timerService.start();
          this.isLoading.set(false);

          if (!state.isOtpSent) {
            this.toast.error(state.errorCode, '');
          }
        },
      });
  }

  submit(): void {
    const data = this.modalData();

    if (!data) {
      return;
    }

    this.isLoading.set(true);

    this.onlineApiService
      .checkOtp$({
        pinfl: data.pinfl,
        phoneNumber: data.phoneNumber,
        otpCode: this.form.code().value(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => {
        if (state.isOtpValidated) {
          if (this.inline()) {
            this.confirmed.emit(true);
          } else {
            this.nmRef?.close(true);
          }
        } else {
          this.otpError.set(true);
          this.inputOtp?.touched.set(true);
        }

        this.isLoading.set(false);
      });
  }
}
