import {ChangeDetectionStrategy, Component, OnInit, signal} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {MatOption} from "@angular/material/autocomplete";
import {MatFormField, MatLabel, MatSuffix} from "@angular/material/form-field";
import {MatSelect} from "@angular/material/select";
import {FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {MatInput} from "@angular/material/input";
import {NgForOf} from "@angular/common";
import {MatIcon} from "@angular/material/icon";
import {MatDatepickerToggleIcon} from "@angular/material/datepicker";
import {UiSvgIconComponent} from "../../../core/components/ui-svg-icon/ui-svg-icon.components";
import {NgxMaskDirective} from "ngx-mask";
import { MatRipple } from '@angular/material/core';

@Component({
    selector: 'app-currency-buy-sell-filter-form',
    imports: [
        MatButton,
        MatOption,
        MatLabel,
        MatFormField,
        MatSelect,
        ReactiveFormsModule,
        MatInput,
        NgForOf,
        MatIcon,
        MatSuffix,
        MatDatepickerToggleIcon,
        UiSvgIconComponent,
        NgxMaskDirective,
        MatRipple
    ],
    templateUrl: './currency-buy-sell-filter-form.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CurrencyBuySellFilterFormComponent {
  currencyFilterForm: FormGroup = new FormGroup({
    dateFrom: new FormControl(),
    dateTo: new FormControl(),
    amountFrom: new FormControl(),
    amountTo: new FormControl(),
    documentId: new FormControl(),
    currency: new FormControl(),
  })

  currencies = signal<string[]>(['UZS', 'USD', 'EUR', 'RUB', 'KZT']);

  resetForm() {
    this.currencyFilterForm.reset();
  }
}
