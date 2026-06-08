// Angular
// Angular
import { TranslateModule } from "@ngx-translate/core"
import { NgxMaskDirective, NgxMaskPipe } from "ngx-mask";
import { CommonModule, NgForOf, NgIf, NgOptimizedImage } from '@angular/common';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output, ViewChildren, QueryList, inject, ViewChild } from '@angular/core';


import { MatMenu } from "@angular/material/menu";
import { MatDivider } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDatepicker, MatDatepickerInput } from "@angular/material/datepicker";

import { MatTooltipModule } from '@angular/material/tooltip';
import { DropdownComponent } from "../../../../../../../../shared/ui/dropdown-menu/dropdown.component"
import { handleKeyDown, parseToCents } from "src/app/core/utils/global-filter.util";
import { formatDate, formatDateRange, getDateRange } from "src/app/core/utils/date.utils";
import { CorpCardService } from "../../../../services/corp-card.service";
import { ToastrService } from "ngx-toastr";
import { categories, periods } from "../../../../constants/corp-card-constants";
import { LimitCategory, LimitInfo } from "../../../../model/limit.model";
import { DatePickerDefaultComponent } from '../../../../../../../../shared/components/date-picker-default/date-picker-default.component';
import { CorpCardLimitStore } from "../../../../store/limit.store";



@Component({
  selector: 'limit-actions',
  templateUrl: './limit-actions.html',
  imports: [
    NgIf,
    NgForOf,
    NgOptimizedImage,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    MatMenu,
    MatDatepicker,
    MatDatepickerInput,
    MatDivider,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    DropdownComponent,
    NgxMaskDirective,
    NgxMaskPipe,
    MatTooltipModule,
    TranslateModule,
    DatePickerDefaultComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})



export class LimitActionsDialogComponent implements OnInit {
  @ViewChildren(DropdownComponent) dropdowns!: QueryList<DropdownComponent>;
  @Output() selectionChange = new EventEmitter<any>();
  @ViewChild('pickerTo') pickerTo!: MatDatepicker<Date>;

  protected readonly receivedData = inject<{
    mode: "CREATE" | "EDIT",
    cardId: string,
    info: LimitInfo,
    category: LimitCategory[]
  }>(MAT_DIALOG_DATA);


  private fb = inject(FormBuilder)
  private toastrService = inject(ToastrService)
  protected corpCardService = inject(CorpCardService)
  protected corpCardLimitStore = inject(CorpCardLimitStore);
  private dialogRef = inject(MatDialogRef<LimitActionsDialogComponent>)
  protected isOptionalDate: boolean = false
  protected today = new Date();
  protected tomorrow = new Date(this.today.getTime() + 24 * 60 * 60 * 1000);


  limitForm = this.fb.group({
    cardUuid: new FormControl<string>(""),
     limitId: new FormControl<number | null>(null, Validators.required),
      amount: new FormControl<number | null>(null, Validators.required),
      cycleType: new FormControl<0 | 3 | null>(null, Validators.required),
      startDate: new FormControl<any | null>(null),
      endDate: new FormControl<any | null>(null),
      isNotification: new FormControl<boolean>(false)
  });

  dateRange = new FormControl<any | null>(null)




  ngOnInit(): void {
    if (this.receivedData.mode === 'CREATE') {
      this.limitForm.patchValue({
        cardUuid: this.receivedData.cardId ?? null,
      });
    }
    else if (this.receivedData.mode === 'EDIT') {
      this.limitForm.patchValue({
        cardUuid: this.receivedData.cardId ?? null,
        limitId: this.receivedData.info.limitId ?? null,
        amount: this.receivedData.info.amount.amount ? this.receivedData.info.amount.amount / 100 : null,
        cycleType: this.receivedData.info.cycleType ?? 0,
        isNotification: this.receivedData.info.isNotification ?? null,
        startDate: formatDate(this.receivedData.info.startDate, "YYYYMMDD", ".") ?? null,
        endDate: formatDate(this.receivedData.info.endDate, "YYYYMMDD", ".") ?? null,
      });

      if (this.receivedData.info.cycleType == 0 && this.receivedData.info.isCustomLimit) {
        this.onPeriodSelected({ type: 0, status: "CUSTOM" })
      } else if (this.receivedData.info.cycleType == 3) {
        this.onPeriodSelected({ type: 3, status: "MONTHLY" })
      } else {
        this.onPeriodSelected({ type: 0, status: "DAILY" })
      }
    }
  }


  openEndPicker() {
    if (this.limitForm.get('startDate')?.value) {
      this.pickerTo.open();
    }
  }


protected onPeriodSelected(data: { type: number, status: "DAILY" | "MONTHLY" | "CUSTOM" }): void {
  this.isOptionalDate = data.status === "CUSTOM";

  const startDateControl = this.limitForm.get('startDate');
  const endDateControl = this.limitForm.get('endDate');

  if (data.status === "CUSTOM") {
    startDateControl?.setValidators(Validators.required);
    endDateControl?.setValidators(Validators.required);
  } else {
    startDateControl?.clearValidators();
    endDateControl?.clearValidators();
  }
  startDateControl?.updateValueAndValidity();
  endDateControl?.updateValueAndValidity();

  let dateRange: { startDate: Date | null; endDate: Date | null } = { startDate: null, endDate: null };
  switch (data.status) {
    case "DAILY": dateRange = this.getLimitDate("today"); break;
    case "MONTHLY": dateRange = this.getLimitDate("month"); break;
    case "CUSTOM": break;
  }
  this.limitForm.patchValue({ ...dateRange, cycleType: data.status === "MONTHLY" ? 3 : 0 });
}

  protected setValues() {
      if (this.limitForm.invalid) {
    this.limitForm.markAllAsTouched();
    return;
  }
    const formattedData: any = {
      cardUuid: this.limitForm.value.cardUuid ?? "",
      limitId: this.limitForm.value.limitId ?? null,
      cycleType: this.limitForm.value.cycleType ?? 3,
      isNotification: this.limitForm.value.isNotification,
      amount: parseToCents(this.limitForm.value.amount) ?? 0,
      startDate: this.formatDate(this.limitForm.value.startDate, "DDMMYYYY", ".") ?? "",
      endDate: this.formatDate(this.limitForm.value.endDate, "DDMMYYYY", ".") ?? "",
    };


    if (this.receivedData.mode === "CREATE") {
      formattedData.customer = "CREATE"
    } else {
      formattedData.customer = "EDIT"
    }

    this.corpCardService.addLimit(formattedData).subscribe({
      next: (res) => {
        if (res == null) {
          this.toastrService.error("accounts.limit_error");
        } else {
          this.toastrService.success(res?.msg);
        };
        this.closeDialog()
      }
    });

  }

  protected resetForm(): void {
    this.dialogRef.close()

  }

  private getLimitDate(type: 'today' | 'month') {
    const today = new Date();
    if (type === 'today') {
      const startDate = new Date(today);
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 1);
      return {
        startDate: (startDate),
        endDate: (endDate),
      };
    }
    if (type === 'month') {
      const startDate = new Date(today);
      const endDate = new Date(today);
      endDate.setMonth(endDate.getMonth() + 1);
      return {
        startDate: (startDate),
        endDate: (endDate),
      };
    }

    return { startDate: null, endDate: null };
  }

  protected closeDialog() {
    this.dialogRef.close();
  }

  protected onDateChange(event: any, from: boolean) {
    if (from) {
      this.limitForm.patchValue({ startDate: event.value })
    } else {
      this.limitForm.patchValue({ endDate: event.value })
    }
  }

  protected onCategorySelected(data: any) {
    this.limitForm.patchValue({limitId: data.limitId});
  }



  protected formatDate = formatDate
  protected parseToCents = parseToCents
  protected getDateRange = getDateRange
  protected handleKeyDown = handleKeyDown
  protected formatDateRange = formatDateRange

  protected readonly periods = periods
  protected readonly categories = categories
}
