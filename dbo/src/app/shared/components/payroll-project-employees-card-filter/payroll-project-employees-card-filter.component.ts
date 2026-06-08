import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter, inject,
  Input,
  Output, signal
} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule} from "@angular/forms";

import {MatOption} from "@angular/material/core";
import {AccountSelectComponent} from "../account-select/account-select.component";
import {FilterButtonComponent} from "../common/filter-button/filter-button.component";
import {MatAccordion, MatExpansionPanel} from "@angular/material/expansion";
import {MatFormField, MatLabel, MatSuffix} from "@angular/material/form-field";
import {MatIcon} from "@angular/material/icon";
import {MatInput} from "@angular/material/input";
import {MatSelect} from "@angular/material/select";
import {NgForOf, NgOptimizedImage, NgTemplateOutlet} from "@angular/common";
import {NgxMaskDirective} from "ngx-mask";


@Component({
    selector: 'app-payroll-project-employees-card-filter',
    imports: [
        AccountSelectComponent,
        FilterButtonComponent,
        MatAccordion,
        MatExpansionPanel,
        MatFormField,
        MatIcon,
        MatInput,
        MatLabel,
        MatOption,
        MatSelect,
        MatSuffix,
        NgOptimizedImage,
        NgTemplateOutlet,
        ReactiveFormsModule,
        NgForOf,
        NgxMaskDirective
    ],
    templateUrl: './payroll-project-employees-card-filter.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PayrollProjectEmployeesCardFilterComponent {
  @Input() panelState = false;
  @Input() type = '';
  @Input() toggleActive = false;
  @Output() refreshFilter = new EventEmitter<any>();
  @Output() filterChange = new EventEmitter();
  private _fb = inject(FormBuilder)
  statuses = signal<string[]>(['NEW', 'ACTIVE', 'WAITING', 'BLOCKED', 'LOCKED', 'DELETED', 'WARNING', 'REQUEST_ACCEPTED', 'CANCELED', 'CREATED', 'READY', 'SUCCESS'])

  translatedStatuses = signal<{ name: string; value: string }[]>([
    {name: 'Новый', value: 'NEW'},
    {name: 'Сохранено', value: 'SAVED'},
    {name: 'Создан', value: 'PREPARE'},
    {name: 'Создано директором', value: 'PREPARE_DIRECTOR'},
    {name: 'Подписание', value: 'SIGN'},
    {name: 'В ожидании', value: 'PENDING'},
    {name: 'Успешно', value: 'SUCCESS'},
    {name: 'Завершено успешно', value: 'COMPLETED_SUCCESS'},
    {name: 'Завершено с ошибкой', value: 'COMPLETED_ERROR'},
    {name: 'Отменено', value: 'CANCEL'},
    {name: 'Ошибка', value: 'ERROR'},
  ]);
  filterForm = this._fb.group({
    cardHolder: new FormControl<string | null>(null),
    cardNumber: new FormControl<string | null>(null),
    startDate: new FormControl<string | null>(null),
    endDate: new FormControl<string | null>(null),
    status: new FormControl<string | null>(null),
  });
  filterFormRoster = this._fb.group({
    startDate: new FormControl<string | null>(null),
    endDate: new FormControl<string | null>(null),
    statuses: new FormControl<string | null>(null),
    docNum: new FormControl<string | null>(null),
    fromAmount: new FormControl<number | null>(null),
    toAmount: new FormControl<number | null>(null),
  });


  search() {
    if (this.type === 'roster-filter') {
      const fromAmount = this.filterFormRoster.value.fromAmount? Number(this.filterFormRoster.value.fromAmount) * 100 : null
      const toAmount = this.filterFormRoster.value.toAmount? Number(this.filterFormRoster.value.toAmount) * 100 : null
      const data = {
        fromAmount: fromAmount,
        toAmount: toAmount,
        docNum: this.filterFormRoster.value.docNum,
        startDate: this.filterFormRoster.value.startDate,
        endDate: this.filterFormRoster.value.endDate,
        statuses: [this.filterFormRoster.value.statuses]
      }
      this.filterChange.emit(data);
    } else {
      this.filterChange.emit(this.filterForm.value);
    }
  }

  clearFilter() {
    if (this.type === 'roster-filter') {
      this.filterFormRoster.reset();
      this.refreshFilter.emit(this.filterFormRoster.value)

    } else {
      this.filterForm.reset();
      this.refreshFilter.emit(this.filterForm.value)
    }
  }

}
