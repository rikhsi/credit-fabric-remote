import { ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { IconComponent } from "../../../shared/ui/icon/icon.component";
import { TranslateModule } from "@ngx-translate/core";
import { NonNullableFormBuilder, ReactiveFormsModule } from "@angular/forms";
import { StatementFormStore } from './statement-form.store';
import { MinorToMajorPipe } from '../../../shared/lib/minor-to-major.pipe';
import {NgClass, NgOptimizedImage} from '@angular/common';
import { RequisiteComponent } from '../../../views/main/features/corp-cards/components/requisite/requisite.component';
import { MatDialog } from '@angular/material/dialog';
import { MatDatepicker, MatDatepickerInput } from '@angular/material/datepicker';
import {
  UploadSummaryComponent
} from '../../../views/main/features/payroll-project/components/employees/create-roaster/upload-summary/upload-summary.component';
import {
  ErrorListComponent
} from '../../../views/main/features/payroll-project/components/employees/create-roaster/error-list/error-list.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { tap } from 'rxjs/operators';
import { NgxMaskDirective } from 'ngx-mask';
import { DataStateWrapperComponent } from '../../../shared/ui/data-state-wrapper/data-state-wrapper.component';
import { STATEMENT_MODE } from './statement-form.model';
import { ShortCardNumberPipe } from '../../../shared/pipes/short-card-number.pipe';
import { cardStatusIcons } from '../../../shared/models/card-status';
import { MonthPeriodPickerComponent } from '../../../shared/ui/month-period-picker/month-period-picker.component';
import {
  InfoModalComponent
} from "../../../views/main/features/kartoteka/kartoteka-2/components/info-modal/info-modal.component";
import { MonthSelectCalendarComponent } from 'src/app/shared/ui/month-select-calendar/month-select-calendar.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-statement-form',
  imports: [
    IconComponent,
    TranslateModule,
    ReactiveFormsModule,
    MinorToMajorPipe,
    NgOptimizedImage,
    MatDatepicker,
    MatDatepickerInput,
    NgxMaskDirective,
    DataStateWrapperComponent,
    ShortCardNumberPipe,
    MonthPeriodPickerComponent,
    MonthSelectCalendarComponent,
    NgClass,
    PaginationComponent,
  ],
  templateUrl: './statement-form.component.html',
  styleUrls: ['../../../shared/components/table-filters/table-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementFormComponent implements OnInit {
  readonly store = inject(StatementFormStore);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly isAccountsOpen = signal(false);
  readonly isPaymentCodeOpen = signal(false);

  readonly today = signal(new Date());

  searchEmployee = this.fb.control<string>('');

  ngOnInit(): void {
    this.store.form.valueChanges.subscribe(res => {
      console.log('res',res)
    })
  }
  private readonly searchValue = toSignal(
    this.searchEmployee.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      tap(val => this.store.setEmployeeFilter(val))
    ),
    { initialValue: '' },
  );

  openRequisites() {
    this.dialog.open(RequisiteComponent, {
      width: '476px',
      height: '100%',
      position: { right: '0' },
      panelClass: 'right-side-dialog',
      data: this.store.transitAccountInfo()
    });
  }

  openKartoteka2Info() {
    this.dialog.open(InfoModalComponent, {
      data: {type: 'BRON'},
      width: "481px",
      minHeight: "426px"
    })
  }

  openErrorList(errorList: any[]) {
    this.dialog.open(ErrorListComponent, { width: '800px' , data: { errorList }});
  }

  openUploadSummary = effect(() => {
    const employeeListByFileUpload = this.store.employeeListByFileUpload();
    if (!employeeListByFileUpload) return;
    this.dialog.open(UploadSummaryComponent, {
      width: '480px',
      data: {
        success: employeeListByFileUpload.successList.length,
        total: employeeListByFileUpload.successList.length + employeeListByFileUpload.errorList.length
      }
    });
  })

  protected readonly STATEMENT_MODE = STATEMENT_MODE;
  protected readonly cardStatusIcons = cardStatusIcons;
}
