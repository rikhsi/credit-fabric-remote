import { NgxMaskPipe } from "ngx-mask";
import { NgIf, NgOptimizedImage } from '@angular/common';
import {ChangeDetectionStrategy, Component, inject, OnChanges, OnInit, SimpleChanges,} from '@angular/core';
import { TranslateService, TranslateModule } from "@ngx-translate/core"

import { MatIcon } from "@angular/material/icon";
import { MatDivider } from "@angular/material/divider";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MAT_DIALOG_DATA, MatDialogClose } from "@angular/material/dialog";


import { PayrollProjectResponseContent } from '../../../../payroll-project/models/payroll-project.type';
import { formatExpireDate } from "src/app/core/utils/global-filter.util";
import { CorpCardService } from "../../../services/corp-card.service";
import { SvgIconComponent } from "src/app/shared/components/svg-icon/svg-icon.component";
import {CardNumberFormatPipe} from "../../../../../../../shared/pipes/card-number-format.pipe";


@Component({
  selector: 'Requisites',
  imports: [
    MatIcon,
    MatDialogClose,
    MatDivider,
    NgOptimizedImage,
    NgxMaskPipe,
    TranslateModule,
    NgIf,
    SvgIconComponent,
    CardNumberFormatPipe
  ],
  templateUrl: './requisite.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class CorpCardInfoRequsite  implements  OnInit{
  protected translate = inject(TranslateService);
  private readonly snackBar = inject(MatSnackBar)
  private corpCardService = inject(CorpCardService);
  public data: PayrollProjectResponseContent = inject(MAT_DIALOG_DATA)
  private translateService = inject(TranslateService)


  ngOnInit() {
    console.log(this.data)
  }

  copyAll(): void {
    const text = this.buildCardDetails(this.data);
    this.copy(text, `${this.translateService.instant('new.card_details_copied')} ✅`, `${this.translateService.instant('new.copy_error_1')}`);
  }

  copy(data: string, successMsg = `${this.translateService.instant('new.copied')} ✅`, errorMsg = `${this.translateService.instant('new.copy_error_1')}`): void {
    if (!navigator?.clipboard) {
      this.showMessage('Clipboard API не поддерживается', true);
      return;
    }

    navigator.clipboard.writeText(data)
      .then(() => this.showMessage(successMsg))
      .catch(() => this.showMessage(errorMsg, true));
  }

  // share(): void {
  //   const text = this.buildCardDetails(this.data);

  //   if (navigator.share) {
  //     navigator
  //       .share({ title: this.translateService.instant('new.card_details'), text })
  //       .then(() => this.showMessage(`${this.translateService.instant('new.shared')} ✅`))
  //       .catch((err) => {
  //         console.error('Share error:', err);
  //         this.showMessage(this.translateService.instant('new.failed_to_share'), true);
  //       });
  //   } else {
  //     this.copy(
  //       text,
  //       `${this.translateService.instant('new.web_share_not_supported_data_copied')} ✅`,
  //       `${this.translateService.instant('new.web_share_is_not_supported_and_copying_failed')}`
  //     );
  //   }
  // }


  // Печать
  protected printCardInfoPdf(cardId: string) {
     if(!cardId) {
      this.showMessage(this.translateService.instant('new.completed_with_an_error'), true);
      return;
    }

    this.corpCardService.corpCardInfoPDF({ id: cardId }).subscribe(info => {
      if (info?.file) {
        const byteCharacters = atob(info.file);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });

        const url = URL.createObjectURL(blob);
        const printWindow = window.open(url);

        if (printWindow) {
          printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
          };
        }
      } else {
        console.error(this.translateService.instant('new.completed_with_an_error'));
      }
    });
  }


  private buildCardDetails(data: any): string {
    const t = this.translate.instant.bind(this.translate);
    const fields = [
      `${t('accounts.card_name')}: ${data.title ?? ''}`,
      `${t('salaryStatements.card_number')}: ${data.pan ?? ''}`,
      `${t('accounts.currency')}: ${data.balance?.currency ?? ''}`,
      `${t('settings.validity_period')}: ${formatExpireDate(data.expiryDate) ?? ''}`,
      `${t('accounts.card_holder')}: ${data.ownerName ?? ''}`,
      `${t('accounts.transit_account_crediting')}: ${data.transitAccount ?? ''}`,
    ];

    return fields.join('\n').trim();
  }

  private showMessage(message: string, isError = false): void {
    this.snackBar.open(message, `${this.translateService.instant('global.close')}`, {
      duration: isError ? 4000 : 2500,
      panelClass: isError ? ['snackbar-error'] : ['snackbar-success'],
    });
  }

  protected get cardStatusIcon(): string {
    const type = this.data?.status?.toUpperCase();
    if (type == 'ACTIVE') {
      return "./assets/new-icons/done-status.svg"
    } else if (type == 'BLOCKED') {
      return "./assets/new-icons/blocked-icon.svg";
    } else {
      return ''
    }
  }

  protected readonly Math = Math;
  protected readonly Number = Number;
  protected readonly navigator = navigator;
  protected formatExpireDate = formatExpireDate;
}
