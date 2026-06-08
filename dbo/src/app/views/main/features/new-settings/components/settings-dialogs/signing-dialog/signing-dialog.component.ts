import {ChangeDetectorRef, Component, inject, Inject, OnInit, signal} from "@angular/core";
import {Router} from "@angular/router";
import {MAT_DIALOG_DATA, MatDialog, MatDialogClose, MatDialogRef} from "@angular/material/dialog";
import {MatDivider} from "@angular/material/divider";
import {QRCodeComponent} from "angularx-qrcode";
import {MatIcon} from "@angular/material/icon";
import {SmsCodeDialogComponent} from "../sms-code-dialog/sms-code-dialog.component";
import {EmailCodeDialogComponent} from "../email-code-dialog/email-code-dialog.component";
import {NgIf, NgStyle} from "@angular/common";
import {NewSettingsService} from "../../../services/new-settings.service";
import {take} from "rxjs";
import {SettingsAuthMyIdComponent} from "../../myId/settings-auth-myId..component";
import {ToastrService} from "ngx-toastr";
import { TranslateModule } from '@ngx-translate/core';
import {
  EspSignConfirmComponent
} from "../../../../../../../core/components/esp-sign-confirm/esp-sign-confirm.component";
import {SignQrModalComponent} from "../sign-qr-modal/sign-qr-modal";
import {UtilsService} from "../../../../../../../core/services/utils.service";
import {StyxService} from "../../../../../../../core/services/styx.service";


@Component({
  selector: "app-signing-dialog",
  templateUrl: "./signing-dialog.component.html",
  styleUrls: ["./signing-dialog.component.scss"],
  imports: [
    MatIcon,
    MatDialogClose,
    MatDivider,
    QRCodeComponent,
    NgIf,
    NgStyle,
    TranslateModule
  ]
})

export class SigningDialogComponent implements OnInit {
  signingType='all'
  loadingConfirm = false;
  webSessionId = ''
  virtualKeys = signal(0)
  physicalKeys = signal(0)
  private dialog = inject(MatDialog)
  constructor(
    public router: Router,
    private matDialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: {
      email: string,
      currentEmail?: string,
      newPhoneNumber: string,
      type: string,
      actionType?: string,
      body?: any,
      permissions?: any,
    },
    private matSigningDialoggRef: MatDialogRef<SigningDialogComponent>,
    private matSmsDialoggRef: MatDialogRef<SmsCodeDialogComponent>,
    private newSettingsService: NewSettingsService,
    private toastService: ToastrService,
    private utilsService: UtilsService,
    private styxService: StyxService,
    private cd: ChangeDetectorRef,
  ) {
    this.signingType = this.data?.type || "all";
  }
  ngOnInit() {
    console.log('data', this.data)
    this.getEspKeys();
    this.utilsService.spinnerState$$.next(false);
  }
  getEspKeys() {
    this.styxService.getInfo().then((res: any) => {
      this.virtualKeys.set(res.infos.filter(item => item.tokenSN === 'Virtual')?.length)
      this.physicalKeys.set(res.infos.filter(item => item.tokenSN !== 'Virtual')?.length)
    })
    this.cd.detectChanges();
  }
  openSmsDialog(): void {
    this.matDialog.closeAll();
    this.matDialog.open(SmsCodeDialogComponent, {
      data: {email: this.data.email},
      width: '540px',
    })
  }
  confirmEmail(): void {
    if (this.loadingConfirm) return;
    this.loadingConfirm = true;
    this.newSettingsService.changeUserEmail({newEmail: this.data.email}).pipe(take(1))
      .subscribe({
        next: (res: any) => {
          const response = res?.result?.data || null;
          if (response){
            this.loadingConfirm = false;
            this.openEmailDialog(response)
          }
          },
        error: (err) => {
          console.log(5555, err)
          this.loadingConfirm = false;
          this.matDialog.closeAll();
        }
      });
  }

  webSessionLoad(): void {
    if (this.loadingConfirm) return;
    this.loadingConfirm = true;
    this.newSettingsService.getWebSession().pipe(take(1))
      .subscribe({
        next: (res: any) => {
          this.webSessionId = res?.sessionId;
          this.loadingConfirm = false;
           this.addQuery(this.webSessionId)
        },
        error: (err) => {
          this.loadingConfirm = false;
          this.matDialog.closeAll();
          this.toastService.error("Произошла ошибка.");

        }
      });

  }

  addQuery(id='') {
    if (!id){
      this.matDialog.closeAll();
      this.toastService.error("Произошла ошибка.");
      return;
    } else {
      this.router.navigate([], {
        relativeTo: undefined,
        queryParams: { sessionId: id },
        queryParamsHandling: 'merge'
      });
      this.openMyIdDialog()
    }

  }
  openMyIdDialog(): void {
    this.matDialog.closeAll();
    this.matDialog.open(SettingsAuthMyIdComponent, {
      data: {newPhoneNumber: this.data.newPhoneNumber},
      width: '540px',
    })
  }
  openEmailDialog(data): void {
    this.matDialog.closeAll();
    this.matDialog.open(EmailCodeDialogComponent, {
      data: {requestId: data?.requestId , resEmail:data?.email,  email: this.data.email, currentEmail: this.data?.currentEmail || ''},
      width: '540px',
    })
  }
  get maskedEmail(): string {
    if (!this?.data?.email) return ""
    const email = this.data.email;
    const [localPart, domainPart] = email.split('@');

    if (!domainPart) {
      return localPart.replace(/^(.{3}).*(.{5})$/, '$1***$2');
    }
    return localPart.replace(/^(.{3}).*(.{2})$/, '$1***$2') + '@' + domainPart;
  }

  espDialog() {
    this.matDialog.closeAll();
    this.matDialog.open(EspSignConfirmComponent, {
      width: '560px',
      data: {action: {...this.data}, transaction: {}, from: "settings" },
    }).afterClosed()
      .subscribe({
        next: res => {
          if (res === 'update') {
            // this.onDetail.emit('sign')
          }
        }
      });
    // dialog.componentInstance.onDetail.subscribe(res => {
    //   this.onDetail.emit(res);
    //   dialog.close();
    // });
  }
  qrDialog(){

    this.matDialog.closeAll();
    this.matDialog.open(SignQrModalComponent, {
      width: '560px',
      data: {...this.data},
    }).afterClosed()
      .subscribe({
        next: res => {
          if (res === 'update') {
            // this.onDetail.emit('sign')
          }
        }
      });
    // if (this.data?.actionType === 'ChangeRole' && this.data?.type === 'physical_virtual_eds_and_qr') {
    //   this.roleChangeQr()
    // } else if (this.data?.actionType === 'ChangeRole') {
    //
    // }
  }
  roleChangeQr(){
    this.newSettingsService.signUserProcess({})
      .pipe(take(1))
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            this.successUserCreate()
          } else {
            const mg = res.result?.message || '';
            this.toastService.error(mg || "Произошла ошибка.");
          }
        },
        error: (err) => {
          const mg = err.result?.message || '';
          this.toastService.error(mg || "Произошла ошибка.");

        }
      });

  }
  successUserCreate(){
    this.toastService.success('Успешно!');
    this.dialog.closeAll();
    this.newSettingsService.triggerRefresh()
  }
}
