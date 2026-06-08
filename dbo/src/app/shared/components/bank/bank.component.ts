import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef, ElementRef,
  Input,
  OnChanges,
  OnInit, SimpleChanges, ViewChild
} from '@angular/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { SearchableComponent } from '../../../core/components/searchable/searchable.component';
import { TabsComponent } from '../tabs/tabs.component';
import { ITab } from '../../interfaces/tab.interface';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OperationsService } from '../../../views/main/features/operations/services/operations.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AlphaNumericSymbolMaskDirective } from '../../directives/alpha-numeric-symbol.directive';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
    selector: 'app-bank',
    imports: [
        MatFormField,
        MatInput,
        MatLabel,
        SearchableComponent,
        TabsComponent,
        ReactiveFormsModule,
        FormsModule,
        AlphaNumericSymbolMaskDirective,
        NgxMaskDirective
    ],
    templateUrl: './bank.component.html',
    styles: ``,
    styleUrls: ['./bank.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BankComponent implements OnInit, OnChanges, AfterContentInit {
  @ViewChild('name') name!: ElementRef<any>;
  @ViewChild('account') account!: ElementRef<any>;
  @ViewChild('address') address!: ElementRef<any>;
  @Input() parentForm!: FormGroup;
  @Input() bicControlName = '';
  @Input() label = 'SWIFT code';
  @Input() bankAccount = '';
  @Input() bankName = '';
  @Input() bankAddress = '';

  @Input() value = '';

  @Input() bankAccountLabel = 'Номер корр. счета';

  isFocused = false;
  orgName = '';

  selectedTab!: ITab;
  bicDatas: any[] = [];
  @Input() tabs: ITab[] = [
    {
      name: '56a.',
      value: '56a',
    },
    {
      name: '56d.',
      value: '56d',
    },
  ];

  form = new FormGroup({
    bic: new FormControl(),
  });

  bankForm = this.fb.group({
    bankAccount: new FormControl(),
    bankName: new FormControl(),
    bankAddress: new FormControl(),
  })

  constructor(
    private _cdRef: ChangeDetectorRef,
    private _operationsService: OperationsService,
    private destroyRef: DestroyRef,
    private fb: FormBuilder,
  ) {
  }

  ngOnInit() {
    this.onlyBankNameAddress();
    this.updateValueViaTemplate();
  }

  updateValueViaTemplate() {
    this.parentForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(val => {
        const bankAccount = val[this.bankAccount];
        const bankName = val[this.bankName];
        const bankAddress = val[this.bankAddress];
        if(bankName?.trim()?.length > 0) {
          setTimeout(() => {
            if(this.name)
            this.name.nativeElement.value = bankName;
          }, 100);
        }
        if(bankAccount?.trim()?.length > 0) {
          setTimeout(() => {
            if(this.account)
            this.account.nativeElement.value = bankAccount;
          }, 100);
        }
        if(bankAddress?.trim()?.length > 0) {
          setTimeout(() => {
            if(this.address)
            this.address.nativeElement.value = bankAddress;
          }, 100);
        }
        this._cdRef.markForCheck();
      })
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes['bicControlName'] && changes['bicControlName'].currentValue !== undefined) {
      this._cdRef.detectChanges();
    }
    if(changes['value'] && changes['value'].currentValue !== undefined) {
      this.setBic();
      this._cdRef.detectChanges();
    }
    if(changes['bankAccount'] && changes['bankAccount'].currentValue !== undefined) {
      this._cdRef.markForCheck();
    }
    if(changes['bankName'] && changes['bankName'].currentValue !== undefined) {
      this._cdRef.markForCheck();
    }
    if(changes['bankAddress'] && changes['bankAddress'].currentValue !== undefined) {
      this._cdRef.markForCheck();
    }
  }

  setBic(event?: any){
    if(this.value) {
      this.form.patchValue({
        bic: this.value,
      });
      this.getBics(this.value);
    }
  }

  ngAfterContentInit() {
    this._cdRef.markForCheck();
  }

  onlyBankNameAddress() {
    if(!this.bicControlName) {
      this.form.reset()
      this.updateParentForm();
    }
  }

  selectTab(tab: ITab) {
    this.selectedTab = tab;

    if(this.selectedTab.value === this.tabs[1]?.value) {
      this.form.reset()
      this.updateParentForm();
    } else {
      this.bankForm.reset();
      this.updateBicForm();
    }
  }

  updateBicForm() {
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (val) => {
          if (this.bicControlName && this.parentForm.contains(this.bicControlName)) {
            this.parentForm.get(this.bicControlName)?.setValue(val.bic);
          }
          this._cdRef.markForCheck();
        }
      })
  }

  updateParentForm() {
    this.bankForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (val => {
          if (this.bankAccount && this.parentForm.contains(this.bankAccount)) {
            this.parentForm.get(this.bankAccount)?.setValue(val.bankAccount);
          }

          if (this.bankName && this.parentForm.contains(this.bankName)) {
            this.parentForm.get(this.bankName)?.setValue(val.bankName);
          }

          if (this.bankAddress && this.parentForm.contains(this.bankAddress)) {
            this.parentForm.get(this.bankAddress)?.setValue(val.bankAddress);
          }
        })
      })
  }

  getBics(value: any) {
    if(value?.length < 2) {
      return;
    }
    this._operationsService.getBics(value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => {
        this.bicDatas = data;
        if(this.value?.length > 0) {
          this.setName(data[0]);
          this.value = '';
        }
        this._cdRef.detectChanges();
      })
  }

  setName(value: any) {
    this.orgName = value.orgName;
  }

  onFocus() {
    this.isFocused = true;
    const bicValue = this.form.getRawValue();
    if(bicValue.bic?.length > 0) {
      this.getBics(bicValue.bic);
    }
  }

  protected readonly onfocus = onfocus;
}
