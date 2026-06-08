import {Component, OnInit, signal, TemplateRef, ViewChild} from "@angular/core";
import {Router} from "@angular/router";
import {MatDialogClose, MatDialogContent} from "@angular/material/dialog";
import {MatDivider} from "@angular/material/divider";
import {QRCodeComponent} from "angularx-qrcode";
import {MatIcon} from "@angular/material/icon";
import {NgForOf, NgIf} from "@angular/common";
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {take} from "rxjs";
import {AuthService} from "../../../../../auth/services/auth.service";
import {UserInfoDto} from "../../../../../../core/models/user.model";
import {SettingUserInfoDto} from "../../models/settings.model";
import { TranslateModule } from '@ngx-translate/core';
import {NewSettingsService} from "../../services/new-settings.service";


@Component({
  selector: "app-organization",
  templateUrl: "./e-signature.component.html",
  styleUrls: ["./e-signature.component.scss"],
  imports: [
    MatDialogContent,
    MatIcon,
    MatDialogClose,
    MatDivider,
    QRCodeComponent,
    NgIf,
    TranslateModule,
    NgForOf,
  ]
})

export class ESignatureComponent implements OnInit {
  data= {}
  dialogRef!: MatDialogRef<any>;
  userInfoItems = signal<UserInfoDto | null>(null);
  signatureList = signal<any>([]);
  popoverStatus = signal<boolean>(false);

  constructor(
    public router: Router,
    private dialog: MatDialog,
    private authService: AuthService,
    private newSettingsService: NewSettingsService,

  ) {}
  ngOnInit() {
    this.loadMyProfile()
    this.loadMySignature()
  }
  loadMyProfile() {
    this.authService.getUserInfo()
      .pipe(take(1))
      .subscribe(res => {
        this.userInfoItems.set(res || null);
      });
  }
  loadMySignature() {
    this.newSettingsService.getUserSignatureList().pipe(take(1)).subscribe({
      next: (res: any) => {
        console.log(5555, res)
        if (res?.success) {
          this.signatureList.set(res?.result?.data?.certificate || null);
        } else {
          this.signatureList.set([]);
        }

      },
      error: (err) => {
        this.signatureList.set([]);
      }
    })
  }
  get userRole(): string {
    const userInfo = this.userInfoItems()?.user
    if (userInfo?.role.length && Array.isArray(userInfo?.role )) {
       return userInfo?.role[0]?.displayName || "";
    }
    return  ''
  }
  get formattedPhone(): string {
    const phone = this.userInfoItems()?.userInfo?.phoneNumber || ''
    if (!phone) return ""
    const digits = phone.replace(/\D/g, '');
    const nineDigits = digits.slice(-9);

    const operator = nineDigits.slice(0, 2);
    const part1 = nineDigits.slice(2, 5);
    const part2 = nineDigits.slice(5, 7);
    const part3 = nineDigits.slice(7, 9);

    return `(${operator}) ${part1} ${part2} ${part3}`;
  }
  formatDateToDDMMYYYY(dateStr: string): string {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
  }
}
