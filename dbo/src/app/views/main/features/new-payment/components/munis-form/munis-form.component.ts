import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef, EventEmitter,
  Input,
  OnChanges,
  OnInit, Output, SimpleChanges
} from '@angular/core';
import { OfficeService } from '../../../my-office/office/service/office.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormField, MatFormFieldModule, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  SearchableSelectComponent
} from '../../../../../../shared/components/searchable-select/searchable-select.component';
import { AmountService } from '../../../../../../core/services/amount.service';
import { PaymentNavItem } from '../../../my-office/office/types/my-office.type';
import { MatOption, MatSelect, MatSelectTrigger } from '@angular/material/select';
import { NgForOf, NgIf, NgOptimizedImage } from '@angular/common';
import { MyOfficeService } from '../../../my-office/office/service/my-office.service';
import { ParamsDto, RegionsDto, SubCategoryDto } from '../../../my-office/office/types/my-office.model';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatIcon } from '@angular/material/icon';
import { UiSvgIconComponent } from '../../../../../../core/components/ui-svg-icon/ui-svg-icon.components';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { MoreActionsComponent } from '../more-actions/more-actions.component';
import { NgxMaskDirective } from 'ngx-mask';
import { UtilsService } from '../../../../../../core/services/utils.service';
import { UserService } from '../../../../../../core/services/user.service';
import { AutoPayForm } from '../../../create-autopay/interfaces/auto-pay.interface';

@Component({
    selector: 'app-munis-form',
    imports: [
        FormsModule,
        MatFormField,
        MatInput,
        MatLabel,
        MatSuffix,
        ReactiveFormsModule,
        SearchableSelectComponent,
        MatSelect,
        MatOption,
        NgOptimizedImage,
        MatAutocompleteTrigger,
        MatIcon,
        MatSelectTrigger,
        NgForOf,
        NgIf,
        UiSvgIconComponent,
        MoreActionsComponent,
        NgxMaskDirective,
    ],
    templateUrl: './munis-form.component.html',
    styles: ``,
    styleUrls: ['./munis-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MunisFormComponent implements OnInit, OnChanges {
  @Input() docNum!: string;
  @Input() docDate!: string;
  @Input() selectedAccount!: any;

  @Input() fromQuery = '';

  @Output() senderAccountTouched = new EventEmitter<boolean>();

  amount = '';
  amountInWords = '';

  description = '';

  user!: any;

  @Input() autoPay = false;
  @Input() autoPayForm!: AutoPayForm;

  paymentAvailable = false;
  paymentParams: any[] = [];
  loadingParams = false;

  categories: PaymentNavItem[] = [];
  subCategories: SubCategoryDto[] = [];
  selectedCategory!: any;
  selectedSubCategory!: any;

  signForm!: FormGroup;

  parentParamsList: ParamsDto[] = []
  childrenParamsList: ParamsDto[] = []
  inputParamsList: ParamsDto[] = []

  constructor(
    private officeService: OfficeService,
    private myOfficeService: MyOfficeService,
    private destroyRef: DestroyRef,
    private amountService: AmountService,
    private fb: FormBuilder,
    private _cdRef: ChangeDetectorRef,
    private toastrService: ToastrService,
    private router: Router,
    private userService: UserService,
    private utilsService: UtilsService,
  ) {
  }

  ngOnInit() {
    this.signForm = this.fb.group({ uuid: [null, [Validators.required]] })
    this.getCategories();
    this.getUserInfo();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedAccount'] && changes['selectedAccount'].currentValue !== undefined) {
      this.selectedAccount = changes['selectedAccount'].currentValue;
    }
    if (changes['docNum'] && changes['docNum'].currentValue !== undefined) {
      this.docNum = changes['docNum'].currentValue;
    }
    if (changes['docDate'] && changes['docDate'].currentValue !== undefined) {
      this.docDate = changes['docDate'].currentValue;
    }
  }

  getUserInfo() {
    this.userService.userInfo$$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          this.user = res?.business;
        }
      })
  }

  getCategories() {
    this.officeService.getCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if(res.success) {
            this.categories = res.result.data.categories;
            this._cdRef.markForCheck();
          }
        }
      })
  }

  updateDecription(event: any) {
    this.description = event.target.value;
  }

  setAmount(event: Event) {
    const value = (event?.target as HTMLInputElement)?.value;
    if(value)
    this.amount = value?.split(' ').join('');
  }

  selectCategory(category: PaymentNavItem) {
    this.selectedCategory = category;
    this.getSubCategories(category);
  }

  getSubCategories(category: PaymentNavItem) {
    this.inputParamsList = this.parentParamsList = this.childrenParamsList = this.subCategories = [];
    Object.keys(this.signForm.controls).forEach(control => control !== 'uuid' ? this.signForm.removeControl(control) : null);
    this.signForm.controls['uuid'].reset();
    this.myOfficeService.getSubcategory(category.uuid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if(res) {
            this.subCategories = res.categories;
          }
        }
      })
  }

  selectSubCategory(subCategory: SubCategoryDto) {
    this.selectedSubCategory = subCategory;
    this.getService(subCategory);
  }

  getService(subCategory: SubCategoryDto) {
    this.loadingParams = true;
    this.inputParamsList = this.parentParamsList = this.childrenParamsList = [];
    Object.keys(this.signForm.controls).forEach(control => control !== 'uuid' ? this.signForm.removeControl(control) : null);

    this.myOfficeService.getServiceOne(subCategory.uuid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if(res) {
            this.parentParamsList = res.params.filter(param => !param.bind && param.type === 'SELECT');
            this.childrenParamsList = res.params.filter(param => param.bind && param.type === 'SELECT');
            this.inputParamsList = res.params.filter(param => param.type !== 'SELECT');
            res.params.forEach(param => {
              let controlName = null;
              if(param.title === 'Наименование плательщика') {
                controlName = this.user.name;
              }
              if(param.title === 'ИНН') {
                controlName = this.user.inn;
              }
              this.signForm.addControl(param.uuid, new FormControl(controlName, Validators.required))
            });
          }
        },
        complete: () => {
          this._cdRef.markForCheck();
          this.loadingParams = false;
        }
      })
  }

  convertAmountIntoWords() {
    const amount = 100;
    if(amount) {
      this.amountInWords = this.amountService.numberToWordsRU(amount);
    } else {
      this.amountInWords = '';
    }
  }


  onParentChange(region: RegionsDto, uuid: string) {
    // this.inputParamsList.forEach(param => this.signForm.controls[param.uuid].reset());
    if (!this.childrenParamsList.length) return;

    this.childrenParamsList = this.childrenParamsList.map(param => {
      // this.signForm.controls[param.uuid].reset();
      if (param.bind !== uuid) return param;
      param.selectValue = region.children;
      return param;
    })
  }

  onChildrenChange() {
    // this.inputParamsList.forEach(param => this.signForm.controls[param.uuid].reset());
  }

  getImageUrl(logo: any) {
    if(!logo) return 'asd';
    return `${logo.path}/${logo.name}.${logo.ext}`;
  }

  cancel() {
    this.paymentAvailable = false;
    this.inputParamsList = this.parentParamsList = this.childrenParamsList = this.subCategories = [];
  }

  isSelectedSenderAccount() {
    if(!this.selectedAccount?.altAcctId) {
      this.senderAccountTouched.emit(!this.selectedAccount?.altAcctId);
      return true;
    }
    return false;
  }

  submit(type = 'DEFAULT') {
    if(this.isSelectedSenderAccount()) {
      return;
    }
    const params = this.getParams();
    if(!this.selectedAccount.altAcctId) {
      return;
    }
    this.utilsService.spinnerState$$.next(true);

    const body: any = {
      docNum: this.docNum,
      docDate: this.docDate,
      senderAccount: this.selectedAccount.altAcctId,
      recipientUuid: this.selectedSubCategory.uuid,
      description: this.description,
      windowType: 'MUNIS',
      params,
      amount: {
        amount: +this.amount * 100,
        scale: 2,
        currency: 'UZS',
      }
    }

    if(this.autoPay) {
      this.fromQuery = 'autopay';
      body.autoPayCreateReq = this.autoPayForm;
      if(this.autoPayForm.name) {
        body.name = this.autoPayForm.name;
      } else {
        body.name = `Автоплатёж ${body.docNum}`;
      }
      body.isAutoPay = true;
      delete body.autoPayCreateReq.name;
    }

    this.myOfficeService.myOfficePaymentPrepare(body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if(res) {
            if(this.autoPay) {
              this.toastrService.success('Автоплатёж создан!');
              this.router.navigate(['templates'], {
                queryParams: {
                  tab: 'AUTO_PAYMENTS'
                }
              });

            } else {
              this.toastrService.success('Транзакция создана!');
              this.router.navigate(['accounts-and-payments'], {
                queryParams: {
                  tab: 'payments'
                }
              });
            }
          }
        }
      })
  }

  checkIsAvailable() {
    if(this.isSelectedSenderAccount()) return;
    const params = this.getParams();

    this.utilsService.spinnerState$$.next(true);
    this.myOfficeService.paynetCheck({ uuid: this.selectedSubCategory.uuid, params })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if(res) {
            this.paymentParams = res.params;
            this.paymentAvailable = true;
            let addServicePayload: any = {
              myOffice: { id: this.selectedCategory.uuid },
              service: { id: this.selectedSubCategory.uuid },
              params,
              title: 'test'
            };
            this._cdRef.detectChanges();
          }
        },
        error: (err) => {
          this.toastrService.error(err.message);
        }
      })
  }

  getParams() {
    const params: any = [...this.parentParamsList, ...this.childrenParamsList, ...this.inputParamsList].map(param => {
      return {
        id: param.id,
        key: '',
        value: param.type === 'SELECT' ? this.signForm.controls[param.uuid].value.value : this.signForm.controls[param.uuid].value,
        uuid: param.uuid,
      }
    });

    return params;
  }

  selectAction(action: any) {
    if(action.value === 'create') {
      this.submit();
    } else if(action.value === 'send') {
      this.submit('SEND');
    }
  }
}
