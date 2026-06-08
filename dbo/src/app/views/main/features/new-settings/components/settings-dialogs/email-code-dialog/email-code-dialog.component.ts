import {Component, Inject, OnInit, signal, ViewChild} from "@angular/core";
import {Router} from "@angular/router";
import {MAT_DIALOG_DATA, MatDialog, MatDialogClose, MatDialogRef} from "@angular/material/dialog";
import {MatDivider} from "@angular/material/divider";
import {QRCodeComponent} from "angularx-qrcode";
import {MatIcon} from "@angular/material/icon";
import {UiOtpInputComponent} from "../../../../../../../core/components/ui-otp-input/ui-otp-input.component";
import {take} from "rxjs";
import {NewSettingsService} from "../../../services/new-settings.service";
import {ToastrService} from "ngx-toastr";
import {UserService} from "../../../../../../../core/services/user.service";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {NgIf} from "@angular/common";


@Component({
  selector: "app-signing-dialog",
  templateUrl: "./email-code-dialog.component.html",
  styleUrls: ["./email-code-dialog.component.scss"],
  imports: [
    MatIcon,
    MatDialogClose,
    MatDivider,
    QRCodeComponent,
    UiOtpInputComponent,
    TranslateModule,
    NgIf
  ]
})

export class EmailCodeDialogComponent implements OnInit {
  @ViewChild(UiOtpInputComponent) otpComponent!: UiOtpInputComponent;
  ngOnInit() {
    console.log(2222)
    this.startTimer()
  }
  errorMessage = signal<string>("");
  errorStatus = signal<boolean>(false);
  countdown = signal(59);
  intervalId?: any;
  requestId: string;
  constructor(
    public router: Router,
    public dialogRef: MatDialogRef<EmailCodeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      requestId: string,
      email: string,
      resEmail: string,
      currentEmail?: string
    },
    private userService: UserService,
    private newSettingsService: NewSettingsService,
    private toastService: ToastrService,
    private matDialog: MatDialog,
    private translateService: TranslateService

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
    if (!this.countdown()) return
    this.newSettingsService.confirmUserEmail({requestId: this.requestId, otpCode: otp}).pipe(take(1))
      .subscribe({
        next: (res: any) => {
          console.log("handleOtp11", res)
          if (res.success) {
            const msg = this.translateService.instant(`settings.success`) || ''
            this.toastService.success(msg.toString());
            // this.newSettingsService.triggerRefresh()
            this.matDialog.closeAll();
            this.userService.logout();
          } else {
            this.errorMessage.set(res?.result?.message || "Произошла ошибка.");
            this.errorStatus.set(true)
          }
          // this.matDialog.closeAll();
        },
        error: (err) => {
          console.error(err);
        }
      });
  }

  // confirmEmail(): void {
  //   this.otpComponent.clearSmsInput()
  //   this.newSettingsService.changeUserEmail({newEmail: this.data.email}).pipe(take(1))
  //     .subscribe({
  //       next: (res: any) => {
  //         this.requestId = res.requestId;
  //       },
  //       error: (err) => {
  //         console.error(err);
  //       }
  //     });
  // }
  get maskedEmail(): string {
    if (!this?.data?.resEmail) return ""
    const email = this.data.resEmail;
    const [localPart, domainPart] = email.split('@');
    if (!domainPart) {
      return localPart.replace(/^(.{3}).*(.{5})$/, '$1***$2');
    }
    return localPart.replace(/^(.{3}).*(.{2})$/, '$1***$2') + '@' + domainPart;
  }

  resendOtpCode(){

    this.newSettingsService.resendUserEmailCode({requestId: this.requestId}).pipe(take(1))
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
  changeInput (item: string): void {
    console.log(444411, item)
    this.errorMessage.set('')
    this.errorStatus.set(false)
  }
}
