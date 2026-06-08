import {Component, OnInit, signal, TemplateRef, ViewChild} from "@angular/core";
import {Router} from "@angular/router";
import {MatDialogClose, MatDialogContent} from "@angular/material/dialog";
import {MatDivider} from "@angular/material/divider";
import {QRCodeComponent} from "angularx-qrcode";
import {MatIcon} from "@angular/material/icon";
import {NgIf} from "@angular/common";
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {Subscription, take} from "rxjs";
import {AuthService} from "../../../../../auth/services/auth.service";
import {UserInfoDto} from "../../../../../../core/models/user.model";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {UiSvgIconComponent} from "../../../../../../core/components/ui-svg-icon/ui-svg-icon.components";
import {EmailCodeDialogComponent} from "../settings-dialogs/email-code-dialog/email-code-dialog.component";
import {SessionsDialogComponent} from "../settings-dialogs/sessions-dialog/sessions-dialog.component";
import {NewSettingsService} from "../../services/new-settings.service";
import {DeviceInfo} from "../../models/settings.model";
import {
  ChangePasswordDialogComponent
} from "../settings-dialogs/change-password-dialog/change-password-dialog.component";
import { TranslateModule } from '@ngx-translate/core';


@Component({
  selector: "app-organization",
  templateUrl: "./security.component.html",
  styleUrls: ["./security.component.scss"],
  imports: [
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule
  ]
})

export class SecurityComponent implements OnInit {
  private subscription!: Subscription;
  data= {}
  dialogRef!: MatDialogRef<any>;
  userInfoItems = signal<UserInfoDto | null>(null);
  deviceList  = signal<DeviceInfo[]>([]);
  constructor(
    public router: Router,
    private dialog: MatDialog,
    private authService: AuthService,
    private newSettingsService: NewSettingsService,
  ) {}
  ngOnInit() {
    this.subscription = this.newSettingsService.refresh$.subscribe(trigger => {
      this.loadMyProfile()
      this.loadDeviceList()
    });

  }
  loadMyProfile() {
    this.authService.getUserInfo()
      .pipe(take(1))
      .subscribe(res => {
        this.userInfoItems.set(res || null);
        console.log(20000, this.userInfoItems()?.business)
      });
  }
  loadDeviceList() {
    this.newSettingsService.getTrustedDeviceList()
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.deviceList.set(res?.result?.data?.devices || [])
          console.log("Response", res);
        },
        error: (err) => {
          console.log("ERROR", err);
        }
      });
  }
  openSessionslDialog(){
    this.dialog.closeAll()
    this.dialog.open(SessionsDialogComponent, {
      data: { devices: this.deviceList() },
      width: '540px',
      height: 'calc(100% - 16px)',
      position: {
        right: '0',
      },
      panelClass: 'right-side-dialog',
    })
  }

  changePasswordDialog(): void{
    this.dialog.closeAll()
    this.dialog.open(ChangePasswordDialogComponent, {
      width: '500px',
      disableClose: true,
      panelClass: 'custom-block-dialog'
    })
  }
}
