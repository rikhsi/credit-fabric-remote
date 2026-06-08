import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from "@angular/material/dialog";
import { MatIcon } from "@angular/material/icon";
import { AccountInfoDto } from "../../../accounts-payments/models/accounts-payments.model";
import { MatDivider } from "@angular/material/divider";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { QRCodeComponent } from 'angularx-qrcode';
import { NgIf } from "@angular/common";
import { NgxMaskPipe } from 'ngx-mask';
import { SvgIconComponent } from 'src/app/shared/components/svg-icon/svg-icon.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-requisite',
  imports: [
    MatIcon,
    MatDivider,
    MatDialogClose,
    QRCodeComponent,
    NgIf,
    NgxMaskPipe,
    SvgIconComponent,
    MatSnackBarModule,
    TranslateModule,
    SvgIconComponent
  ],
  templateUrl: './requisite.component.html',
  styles: ``,
  styleUrls: ['./requisite.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class RequisiteComponent implements OnInit {
  private translateService = inject(TranslateService)
  public readonly data: AccountInfoDto = inject(MAT_DIALOG_DATA)
  private readonly snackBar = inject(MatSnackBar)
  protected readonly Number = Number;
    public dialogRef = inject(MatDialogRef<RequisiteComponent>);


  ngOnInit(): void {
  }

  copyAll() {
    const textToCopy = `
${this.translateService.instant('myAccounts.account_number')}: ${this.data.accountNumberCard}
${this.translateService.instant('myAccounts.account_name')}: ${this.data.accountType}
${this.translateService.instant('myAccounts.organization_name')}: ${this.data.holderInfo}
${this.translateService.instant('myAccounts.bank_mfo')}: ${this.data.mfo}
${this.translateService.instant('myAccounts.inn')}: ${this.data.inn}
${this.translateService.instant('new.account_opening_date')}: ${this.data.openDate}
  `;

    navigator.clipboard.writeText(textToCopy).then(() => {
      this.snackBar.open(`${this.translateService.instant('new.details_copied')} ✅`, this.translateService.instant('myAccounts.close'), { duration: 3000 });
    });
  }

  copy(value: any) {
    navigator.clipboard.writeText(value).then(() => {
      this.snackBar.open(`${this.translateService.instant('new.copied')} ✅`, this.translateService.instant('myAccounts.close'), { duration: 3000 });
    })
  }


    integerPart(balance): string {
    const amount = (balance ?? 0) / 100;
    const [int] = amount.toFixed(2).split('.');
    return Number(int).toLocaleString().replace(/,/g, ' ');
  }

  decimalPart(balance): string {
    const amount = (balance ?? 0) / 100;
    const [, dec] = amount.toFixed(2).split('.');
    return dec;
  }




    formatDocDate(createdAt: string): string {
    const [datePart, timePart] = createdAt.split(" ");
    const [day, month, year] = datePart.split(".");
    const [hour, minute] = timePart?.split(":");

     const translateMonths = [
        'new.january',
        'new.february',
        'new.march',
        'new.april',
        'new.may',
        'new.june',
        'new.july',
        'new.august',
        'new.september',
        'new.october',
        'new.november',
        'new.december'
      ];

    const monthKey = translateMonths[parseInt(month, 10) - 1];
    const monthName = this.translateService.instant(monthKey);

    return `${parseInt(day, 10)} ${monthName} ${year}, ${hour}:${minute}`;
  }


  share() {
    const textToShare = `
${this.translateService.instant('myAccounts.account_number')}: ${this.data.accountNumberCard}
${this.translateService.instant('myAccounts.account_name')}: ${this.data.accountType}
${this.translateService.instant('myAccounts.organization_name')}: ${this.data.holderInfo}
${this.translateService.instant('myAccounts.bank_mfo')}: ${this.data.mfo}
${this.translateService.instant('myAccounts.inn')}: ${this.data.inn}
${this.translateService.instant('global.account_opening_date')}: ${this.data.openDate}
  `;

    if (navigator.share) {
      navigator.share({
        title: this.translateService.instant('myAccounts.account_details_alt'),
        text: textToShare
      }).then(() => {
      }).catch(err => {

      });
    } else {
    }
  }



  closeDialog() {
    this.dialogRef.close()
  }




  protected readonly navigator = navigator;
}
