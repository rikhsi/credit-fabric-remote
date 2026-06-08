import { TranslateModule } from "@ngx-translate/core"
import { NgForOf, NgIf, NgOptimizedImage } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";

import { NgxMaskPipe } from "ngx-mask";
import { MatIcon } from "@angular/material/icon";
import { MatCard } from "@angular/material/card";
import { MatDivider } from "@angular/material/divider";
import { MAT_DIALOG_DATA, MatDialog, MatDialogClose, MatDialogRef } from "@angular/material/dialog";
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelTitle,
  MatExpansionPanelHeader
} from "@angular/material/expansion";

import { RemoveLimitDialogComponent } from "../remove/remove";

import { customPeriods, periods } from "../../../../constants/corp-card-constants";
import { LimitInfo } from "../../../../model/limit.model";

import { getSelectedData } from "src/app/core/utils/form-filter.util";
import { getFormattedAmount, parseToCents } from "src/app/core/utils/global-filter.util";
import { CorpCardLimitStore } from "../../../../store/limit.store";
import { formatTimestamp } from "src/app/core/utils/date.utils";
import { LimitActionsDialogComponent } from "../actions/limit-actions";

@Component({
  selector: "app-limit-dialog",
  templateUrl: "./limit-list.html",
  styleUrls: ["./limit-list.scss"],
  imports: [
    MatIcon,
    MatDialogClose,
    MatDivider,
    NgOptimizedImage,
    NgIf,
    NgxMaskPipe,
    MatCard,
    NgForOf,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription,
    MatExpansionPanelHeader,
    TranslateModule
  ]
})

export class LimitDialogComponent implements OnInit {
  private dialog = inject(MatDialog)
  private corpCardLimitStore = inject(CorpCardLimitStore);
  private readonly dialogRef = inject(MatDialogRef<LimitDialogComponent>);
  protected readonly receivedData = inject<{ cardId: string, info: LimitInfo, histories: LimitInfo[], hasLimit: boolean }>(MAT_DIALOG_DATA);


  ngOnInit(): void {
    console.log("receivedData",this.receivedData)
    this.corpCardLimitStore.loadLimitCategories();
  }

  createLimit() {
    this.closeDialog()
    this.dialog.open(LimitActionsDialogComponent, {
      data: {
        mode: 'CREATE',
        cardId: this.receivedData?.cardId,
        category: this.corpCardLimitStore.limitCategories(),
      },
      width: '517px',
      height: 'calc(100% - 16px)',
      position: { right: '0'},
      panelClass: 'right-side-dialog',
    });
  }

  editLimit(): void {
    this.closeDialog()
    this.dialog.open(LimitActionsDialogComponent, {
      data: {
        mode: 'EDIT',
        cardId: this.receivedData?.cardId,
        category: this.corpCardLimitStore.limitCategories(),
        info: this.receivedData?.info,
      },
      width: '517px',
      height: 'calc(100% - 16px)',
      position: { right: '0' },
      panelClass: 'right-side-dialog',
    });
  }

  removeLimit() {
    this.closeDialog()
    this.dialog.open(RemoveLimitDialogComponent, {
      data: { cardId: this.receivedData?.cardId },
      width: '450px',
    });
  }

  // HELPERS

  protected closeDialog(): void {
    this.dialogRef.close();
  }

  protected getPeriodLabel(type: number | undefined, isCustomLimit: boolean | undefined): string {
    if (type == 3) {
      return "accounts.monthly"
    } else if (type == 0 && !isCustomLimit) {
      return "accounts.daily"
    } else if (type == 0 && isCustomLimit) {
      return "accounts.custom"
    } else {
      return ""
    }
  }


  get remainingBalance(): number {
    const info = this.receivedData?.info;
    if (!info) return 0;

    const total = info.amount?.amount ?? 0;
    const used = info.usedAmount?.amount ?? 0;

    const result = Math.max(0, total - used)

    return result > 0 ? result : 0;
  }

  get limitUsagePercent(): number {
    const info = this.receivedData?.info;
    if (!info || !info.amount || !info.usedAmount) return 0;

    const total = info.amount.amount ?? 0;
    const used = info.usedAmount.amount ?? 0;

    if (total <= 0) return 0;
    const percent = (used / total) * 100;

    return Math.min(Math.max(percent, 0), 100);
  }


  protected Math = Math;
  protected periods = periods;
  protected customPeriods = customPeriods;
  protected parseToCents = parseToCents
  protected formatTimestamp = formatTimestamp
  protected getFormattedBalance = getFormattedAmount;
}
