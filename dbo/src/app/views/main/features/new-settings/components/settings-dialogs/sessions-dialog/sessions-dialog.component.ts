import {Component, inject, Inject, OnInit, signal, TemplateRef} from "@angular/core";
import {Router} from "@angular/router";
import {MAT_DIALOG_DATA, MatDialog, MatDialogClose} from "@angular/material/dialog";
import {MatDivider} from "@angular/material/divider";
import {QRCodeComponent} from "angularx-qrcode";
import {MatIcon} from "@angular/material/icon";
import {UiOtpInputComponent} from "../../../../../../../core/components/ui-otp-input/ui-otp-input.component";
import {DatePipe, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {DeviceInfo} from "../../../models/settings.model";
import {take} from "rxjs";
import {NewSettingsService} from "../../../services/new-settings.service";
import {ToastrService} from "ngx-toastr";
import {log} from "@angular-devkit/build-angular/src/builders/ssr-dev-server";
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {UserService} from "../../../../../../../core/services/user.service";


@Component({
  selector: "app-signing-dialog",
  templateUrl: "./sessions-dialog.component.html",
  styleUrls: ["./sessions-dialog.component.scss"],
  standalone: true,
  imports: [
    MatIcon,
    MatDialogClose,
    MatDivider,
    QRCodeComponent,
    UiOtpInputComponent,
    NgOptimizedImage,
    NgForOf,
    NgIf,
    TranslateModule
  ],
  providers: [DatePipe]
})

export class SessionsDialogComponent {
  public datePipe = inject(DatePipe)
  selectDeviceId: string | null = null
  selectDeviceModel = signal('')
  currentDevice = signal<DeviceInfo[]>([])
  otherDevice = signal<DeviceInfo[]>([])
  constructor(
    public router: Router,
    @Inject(MAT_DIALOG_DATA) public data: {
      devices: DeviceInfo[]
    },
    private translateService: TranslateService,
    private dialog: MatDialog,
    private newSettingsService: NewSettingsService,
    private toastrService: ToastrService,
    public userService: UserService,
  ) {}

  ngOnInit() {
    if ( this.data?.devices?.length) {
      const currentData = this.data.devices.filter(device => device.current);
      this.currentDevice.set(currentData)
      const otherData = this.data.devices.filter(device => !device.current);
      this.otherDevice.set(otherData)
      console.log(22222, this.currentDevice(), this.otherDevice());
    }

  }
  handleOtp(otp: any): void {
    console.log(555, otp)
  }

   formatRussianDate(input: string): string {
    const [datePart, timePart] = input.split(" ");
    const [day, month, year] = datePart.split(".");
    const [hours, minutes] = timePart.split(":");

    const date = new Date(+year, +month - 1, +day, +hours, +minutes);

    const weekday = new Intl.DateTimeFormat('ru-RU', { weekday: 'short' }).format(date);
    const dayStr = day.padStart(2, '0');
    const monthStr = new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(date);
    const yearStr = year;
    const timeStr = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;

    return `${weekday}, ${dayStr} ${monthStr} ${yearStr}, ${timeStr}`;
  }
  deleteSessionlDialog(uuid: string | null, model, template: TemplateRef<unknown>) {
     if (!uuid) return;
     this.selectDeviceModel.set(model || '');
     this.selectDeviceId = uuid;
    console.log(44333, uuid);
    this.dialog?.closeAll();
    setTimeout(() => {
      this.dialog.open(template, {
        width: '480px',
        disableClose: true,
        panelClass: 'custom-block-dialog'
      });
    }, 300)

  }
  deleteSession() {
  if (!this.selectDeviceId) return
    this.newSettingsService.deleteTrustedDevice({uuid: this.selectDeviceId})
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          console.log("Response", res);
          if (res.success) {
            this.dialog?.closeAll();
            const msg = this.translateService.instant(`settings.success`) || ''
            this.toastrService.success(msg.toString());
            this.newSettingsService.triggerRefresh()
          } else {
            this.dialog?.closeAll();
            this.toastrService.error(res?.error?.message || 'Что то понло не так...');
          }
        },
        error: (err) => {
          console.log("ERROR", err);
        }
      });

  }
  closeDialog(){
    this.dialog?.closeAll();
  }
  deleteAllSessionlDialog(template: TemplateRef<unknown>){
    console.log("deleteAllSessionlDialog");
    this.dialog?.closeAll();
    setTimeout(() => {
      this.dialog.open(template, {
        width: '480px',
        disableClose: true,
        panelClass: 'custom-block-dialog'
      });
    }, 300)
  }
  deleteAllSession(){
    this.newSettingsService.deleteAllTrustedDevice()
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          console.log("Response", res);
          if (res.success) {
            this.dialog?.closeAll();
            const msg = this.translateService.instant(`settings.success`) || ''
            this.toastrService.success(msg.toString());
            // this.newSettingsService.triggerRefresh()
            // this.userService.logout()
            this.newSettingsService.triggerRefresh()
          } else {
            this.dialog?.closeAll();
            this.toastrService.error(res?.error?.message || 'Что то понло не так...');
          }
        },
        error: (err) => {
          console.log("ERROR", err);
        }
      });
  }
}
