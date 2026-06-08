import {Component, Inject, OnInit, signal, ViewChild} from "@angular/core";
import {Router} from "@angular/router";
import {MAT_DIALOG_DATA, MatDialog, MatDialogClose, MatDialogRef} from "@angular/material/dialog";
import {MatDivider} from "@angular/material/divider";
import {QRCodeComponent} from "angularx-qrcode";
import {MatIcon} from "@angular/material/icon";
import {UiOtpInputComponent} from "../../../../../../../core/components/ui-otp-input/ui-otp-input.component";
import {NewSettingsService} from "../../../services/new-settings.service";
import {take} from "rxjs";
import {ToastrService} from "ngx-toastr";
import {SettingsAuthMyIdComponent} from "../../myId/settings-auth-myId..component";
import {UserService} from "../../../../../../../core/services/user.service";
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {NgIf} from "@angular/common";


@Component({
  selector: "app-signing-dialog",
  templateUrl: "./sms-code-dialog.component.html",
  styleUrls: ["./sms-code-dialog.component.scss"],
  imports: [
    MatIcon,
    MatDialogClose,
    UiOtpInputComponent,
    TranslateModule,
    NgIf
  ]
})

export class SmsCodeDialogComponent implements OnInit {
  @ViewChild(UiOtpInputComponent) otpComponent!: UiOtpInputComponent;
  ngOnInit() {
    console.log(2222)
    this.startTimer()
  }
  countdown = signal(59);
  intervalId?: any;
  requestId: string;
  errorMessage = signal<string>("");
  errorStatus = signal<boolean>(false);
  constructor(
    public router: Router,
    private matDialog: MatDialog,
    public dialogRef: MatDialogRef<SmsCodeDialogComponent>,
    private translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: {
      requestId: string,
      newPhoneNumber: string,
      sessionId?: string,
      type?: string,
    },
    private newSettingsService: NewSettingsService,
    private toastService: ToastrService,
    private userService: UserService,
  ) {
    this.requestId = data.requestId;
  }

  startTimer() {
    this.countdown.set(59);
    this.intervalId = setInterval(() => {
      const current = this.countdown();
      if (current > 0) {
        this.countdown.set(current - 1);
      } else {
        clearInterval(this.intervalId);
      }
    }, 1000);
  }
  handleOtp(otp: any): void {
    console.log(3333)
    if (!this.countdown()) return
    if (this.data.type === 'passwordChange') {
      this.newSettingsService.checkUserPasswordOtp({requestId: this.requestId, otpCode: otp, sessionId: this?.data?.sessionId}).pipe(take(1))
        .subscribe(
          {
            next: (res: any) => {
              console.log("handleOtp11", res)
              if (res?.success) {
                this.matDialog.closeAll();
                this.addQuery(res)
              } else {
                // this.toastService.error("Произошла ошибка.");
                // this.matDialog.closeAll();
                console.log("handleOtp12", res)
                this.errorMessage.set(res?.result?.message || "Произошла ошибка.");
                this.errorStatus.set(true)
              }

            },
            error: (err) => {
              console.error(err);
            }
          }
        );
    } else {
      this.newSettingsService.confirmUserPhone({requestId: this.requestId, otpCode: otp}).pipe(take(1))
        .subscribe(
          {
            next: (res: any) => {
              console.log("handleOtp11", res)
              if (res.success) {
                const msg = this.translateService.instant(`settings.success`) || ''
                this.toastService.success(msg);
                // this.newSettingsService.triggerRefresh()
                this.matDialog.closeAll();
                this.userService.logout();
              } else {
                // this.toastService.error("Произошла ошибка.");
                this.errorMessage.set(res?.result?.message || "Произошла ошибка.");
                this.errorStatus.set(true)
              }

              },
            error: (err) => {
              console.error(err);
            }
          }
        );
    }

  }

  resendOtpCode(){
    if (this.data.type === 'passwordChange') {
      this.newSettingsService.resendUserPasswordCode({id: this.requestId}).pipe(take(1))
        .subscribe({
          next: (res: any) => {
            if (res.success) {
              console.log("handleOtp11666", res)
              this.requestId = res.result?.data?.requestId || '';
              clearInterval(this.intervalId);
              this.startTimer()
            } else {
              const msg = res?.result?.message || 'Произошла ошибка.'
              this.toastService.error(msg);
              this.matDialog.closeAll();
            }
          },
          error: (err) => {
            console.error(err);
            const msg = err?.message  || 'Произошла ошибка.'
            this.toastService.error(msg);
            this.matDialog.closeAll();
          }
        });
    } else {
      this.newSettingsService.resendUserPhoneCode({requestId: this.requestId}).pipe(take(1))
        .subscribe({
          next: (res: any) => {
            if (res.success) {
              console.log("handleOtp11666", res)
              this.requestId = res.result?.data?.requestId || '';
              clearInterval(this.intervalId);
              this.startTimer()
            } else {
              const msg = res?.result?.message || 'Произошла ошибка.'
              this.toastService.error(msg);
              this.matDialog.closeAll();
            }
          },
          error: (err) => {
            console.error(err);
            const msg = err?.message  || 'Произошла ошибка.'
            this.toastService.error(msg);
            this.matDialog.closeAll();
          }
        });
    }

  }



  changeInput (item: string): void {
    console.log(444411, item)
    this.errorMessage.set('')
    this.errorStatus.set(false)
  }
  addQuery(item: any) {
    if (!item?.result?.data?.sessionId){
      this.matDialog.closeAll();
      this.toastService.error("Произошла ошибка.");
      return;
    } else {
      this.router.navigate([], {
        relativeTo: undefined,
        queryParams: { sessionId: item?.result?.data?.sessionId, type: 'passwordChange', requestId: item?.result?.data?.requestId  },
        queryParamsHandling: 'merge'
      });
      this.openMyIdDialog(item)
    }

  }
  openMyIdDialog(item:any): void {
    this.matDialog.closeAll();
    this.matDialog.open(SettingsAuthMyIdComponent, {
      data: {requestId: item?.result?.data?.requestId, },
      width: '540px',
    })
  }

  get maskedPhone(): string {
    if (!this.data.newPhoneNumber) return ""
    let digits = this.data.newPhoneNumber.replace(/\D/g, '');

    if (digits.startsWith('998')) {
      digits = digits.slice(3);
    }

    if (digits.length !== 9) return this.data.newPhoneNumber;

    const region = digits.slice(0, 2);
    const middle = digits.slice(2, 5);
    const last4 = digits.slice(5);

    return `+998 (${region}) ••• ${last4.slice(0, 2)} ${last4.slice(2)}`;
  }
}
