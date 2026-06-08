import {Component, inject, OnDestroy, OnInit, signal, TemplateRef, ViewChild} from "@angular/core";
import {Router} from "@angular/router";
import {MatDialogClose, MatDialogContent} from "@angular/material/dialog";
import {MatDivider} from "@angular/material/divider";
import {QRCodeComponent} from "angularx-qrcode";
import {MatIcon} from "@angular/material/icon";
import {NgForOf, NgIf} from "@angular/common";
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {Subscription, take} from "rxjs";
import {AuthService} from "../../../../../auth/services/auth.service";
import {UserInfoDto} from "../../../../../../core/models/user.model";
import {MatSnackBar} from "@angular/material/snack-bar";
import { TranslateModule } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import {NewSettingsService} from "../../services/new-settings.service";
import {BusinessInfo, TariffDto} from "../../models/settings.model";
import {ToastrService} from "ngx-toastr";
import {
  UserSignOrderDialogComponent
} from "../settings-dialogs/user-sign-order-dialog/user-sign-order-dialog.component";
import {SessionsDialogComponent} from "../settings-dialogs/sessions-dialog/sessions-dialog.component";
import {TariffsDialogComponent} from "../settings-dialogs/tariffs-dialog/tariffs-dialog.component";


@Component({
  selector: "app-organization",
  templateUrl: "./organization.component.html",
  styleUrls: ["./organization.component.scss"],
    imports: [
        NgIf,
        TranslateModule,
        NgForOf,
    ]
})

export class OrganizationComponent implements OnInit, OnDestroy {
  private readonly snackBar = inject(MatSnackBar)
  // implements OnInit, OnDestroy
  data= {}
  dialogRef!: MatDialogRef<any>;
  userInfoItems = signal<UserInfoDto | null>(null);
  tariffList = signal<TariffDto[] | null>(null);
  businessInfoItems = signal<BusinessInfo | null>(null);
  accountMainInfo = signal<any | null>(null);
  routerInfoItems = signal<any>(null);
  errorMessage = signal<string>("");
  private subscription!: Subscription;

  constructor(
    public router: Router,
    private dialog: MatDialog,
    private authService: AuthService,
    private newSettingsService: NewSettingsService,
    private translateService: TranslateService,
    private toastrService: ToastrService


) {}
  ngOnInit() {
    this.loadMyProfile()
    this.loadAccountMain()
    this.loadAccountTariffs()

    this.subscription = this.newSettingsService.refresh$.subscribe(trigger => {
      this.loadMyProfile()
      this.loadRouters()

    });


  }
  loadRouters() {
    this.newSettingsService.getRouterList().pipe(take(1))
      .subscribe({
        next: (res) => {
          console.log(5556, res)
          if (res?.success) {
            this.routerInfoItems.set(res?.result?.data || null);
            const usedItem = this.routerInfoItems().find((i) => i.isUsed);

          } else {
            this.errorMessage.set(res?.result?.message || '');
          }
        },
        error: (err: any) => {
          this.toastrService.error(err || err.message || 'Что то понло не так...');
        }
      });

    // .subscribe(res => {
    //   this.routerInfoItems.set(res || null);
    //   const usedItem = this.routerInfoItems().find((i) => i.isUsed);
    //   this.selectedRouterId = usedItem ? usedItem.uuid : null;
    // });
  }
  loadAccountMain() {
    this.newSettingsService.getAccountMainInfo().pipe(take(1)).subscribe({
      next: (res: any) => {
        console.log(5555, res)
       this.accountMainInfo.set(res?.result?.data || null);
      },
      error: (err) => {
        this.accountMainInfo.set(null);
      }
    })
  }
  loadMyProfile() {
    this.newSettingsService.getBusinessInfo().pipe(take(1)).subscribe({
      next: (res: any) => {
        console.log(5555, res)
       this.businessInfoItems.set(res?.result?.data || null);
      },
      error: (err) => {}
    })
  }
  loadAccountTariffs() {
    this.newSettingsService.getBusinessTariffs().pipe(take(1)).subscribe({
      next: (res: any) => {
        this.tariffList.set(res?.result?.data?.tariffs || null);
      },
      error: (err) => {}
    })
  }
  copyToClipboard(value: string) {
    if (!value) return;
    navigator.clipboard.writeText(value);
    this.snackBar.open(`${this.translateService.instant('new.data_copied')} ✅`, this.translateService.instant('notifications.close'), { duration: 3000 });
  }

  copyAll() {
    const info = this.businessInfoItems();
    const text = `
${this.translateService.instant('settings.company_name')}: ${info?.name}
Адрес: ${info?.address}
${this.translateService.instant('settings.phone')}: ${info?.phone}
${this.translateService.instant('settings.email_alt')}: ${info?.email}
${this.translateService.instant('settings.inn_pinfl')}: ${info?.inn || info?.pinfl}
${this.translateService.instant('global.mfo')}: ${info?.mainFilial}
${this.translateService.instant('settings.bank_name')}: ${info?.organizationName}
Основной, Расчетный счет: ${this.accountMainInfo()?.message}
`;
    navigator.clipboard.writeText(text);

    this.snackBar.open(`${this.translateService.instant('new.data_copied')} ✅`, this.translateService.instant('notifications.close'), { duration: 3000 });
  }

  toggleEditing(){
    this.dialog.closeAll()
    this.dialog.open(UserSignOrderDialogComponent, {
    width: '540px',
      height: 'calc(100% - 16px)',
      position: {
      right: '0',
    },
    panelClass: 'right-side-dialog',
  })
}
  downloadInfo() {
      this.newSettingsService.downloadOrganizationInfo()
        .pipe(take(1))
        .subscribe({
          next: (res) => {
            console.log("Response", res.result);
            if (res.success && res?.result?.data?.file) {
              const base64 = res?.result?.data?.file;

              // Base64 → Blob
              const byteCharacters = atob(base64);
              const byteNumbers = new Array(byteCharacters.length);

              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }

              const byteArray = new Uint8Array(byteNumbers);
              const blob = new Blob([byteArray], { type: 'application/pdf' });

              // Download
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');

              a.href = url;
              a.download = 'document.pdf';
              a.click();

              window.URL.revokeObjectURL(url);
            } else {
              this.toastrService.error(res?.error?.message || 'Что то понло не так...');
            }
          },
          error: (err) => {
            console.log("ERROR", err);
          }
        });

  }

  openTariffDialog() {

      this.dialog.closeAll()
      this.dialog.open(TariffsDialogComponent, {
        data: { tariffs: this.tariffList() },
        width: '517px',
        height: 'calc(100% - 16px)',
        position: {
          right: '0',
        },
        panelClass: 'right-side-dialog',
      })
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
