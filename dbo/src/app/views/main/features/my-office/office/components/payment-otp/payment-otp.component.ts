import { DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  ViewContainerRef,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { UserDataDto } from 'src/app/core/models/user.model';
import { UiOtpInputComponent } from 'src/app/core/utils/ui-otp-input.component';

import { MyOfficeService } from '../../service/my-office.service';

@Component({
    selector: 'app-payment-otp',
    imports: [CommonModule, UiOtpInputComponent],
    templateUrl: './payment-otp.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentOtpComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  maskedPhoneNumber = '';
  isOtpIncorrect = false;
  @Input() token = '';
  @Input() phone = '';

  otpCode = new FormControl('', [
    Validators.required,
    Validators.minLength(5),
    Validators.maxLength(5),
  ]);
  timer = 60;
  intervalId!: NodeJS.Timer;

  constructor(
    // private authService: AuthService,
    private viewContainerRef: ViewContainerRef,
    private translate: TranslateService,
    private cdRef: ChangeDetectorRef,
    private toastrService: ToastrService,
    public dialogRef: DialogRef,
    private myOfficeService: MyOfficeService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: { additional: string; externalId: string }
  ) {}

  ngOnInit(): void {
    this.startCounter();
    const user = JSON.parse(localStorage.getItem('user')!) as UserDataDto;
    this.maskPhoneNumber(user.username);
  }

  maskPhoneNumber(num: string) {
    const countryCode = num.slice(0, 3);
    const code = num.slice(3, 5);
    const last = num.slice(-2);
    this.maskedPhoneNumber = `${countryCode} (${code}) ***-**-${last}`;
  }

  handleOtp(otp: string): void {
    this.otpCode.setValue(otp);
  }

  startCounter(): void {
    if (this.timer === 0) {
      this.stopCounter();
      return;
    }
    this.intervalId = setInterval(() => {
      this.timer === 0 ? this.stopCounter() : this.timer--;
      this.cdRef.detectChanges();
    }, 1000);
  }
  stopCounter(): void {
    this.intervalId && clearInterval(this.intervalId as any);
  }
  resetCounter(): void {
    this.stopCounter();
    this.timer = 60;
    this.startCounter();
  }
  get counter(): string {
    const minutes = Math.floor(this.timer / 60).toString();
    const seconds = (this.timer % 60).toString();
    return `${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
  }

  onSubmit(): void {
    if (this.otpCode.value?.length !== 5) return;
    this.myOfficeService.myOfficePaymentSignConfirm({
      confirmCode: +this.otpCode.value,
      externalId: this.data.externalId,
      resend: false,
    }).subscribe(res => {
      if(res?.result?.[0]?.success) this.toastrService.success('Успешно');
      this.router.navigate(['../my-office/main'])
      this.dialogRef.close();
    });
  }

  openErrorAlert(msg: string): void {
    this.isOtpIncorrect = true;
    const { incorrectOtpEntered } = this.translate.instant('auth');
    const message = msg || incorrectOtpEntered;
    this.showErrorAlert(message);
  }

  showErrorAlert(message: string): void {
    // const alert = this.viewContainerRef.createComponent(AlertComponent);
    // alert.instance.message = message;
    // this.cdRef.detectChanges();
    // alert.instance.closed.pipe(takeUntil(this.destroy$)).subscribe(() => {
    //   alert.destroy();
    // });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopCounter();
  }
}
