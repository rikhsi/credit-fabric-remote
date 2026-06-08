import {ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {
    AccountRequisitesComponent
} from "../../../../../../../shared/components/account-requisites/account-requisites.component";
import {AccountSelectComponent} from "../../../../../../../shared/components/account-select/account-select.component";
import {ContainerNavComponent} from "../../../../../../../shared/components/container-nav/container-nav.component";
import {
    ContainerTitleComponent
} from "../../../../../../../shared/components/container-title/container-title.component";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatFormField, MatLabel, MatSuffix} from "@angular/material/form-field";
import {MatIcon} from "@angular/material/icon";
import {MatInput} from "@angular/material/input";
import {MatOption} from "@angular/material/autocomplete";
import {MatRipple} from "@angular/material/core";
import {MatSelect} from "@angular/material/select";
import {NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {NgxMaskDirective} from "ngx-mask";
import {AccountsDto} from "../../../../accounts-payments/models/accounts-payments.model";
import {MonthsForSalary} from "../../../../payroll-project/constants/table-btn";
import {ActivatedRoute, Router} from "@angular/router";
import {AccountsPaymentsService} from "../../../../accounts-payments/services/accounts-payments.service";
import {RightBarService} from "../../../../../right-bar/services/right-bar.service";
import {SalaryProjectService} from "../../../../../../../core/services/salary-project.service";
import {UtilsService} from "../../../../../../../core/services/utils.service";
import {ToastrService} from "ngx-toastr";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {LocationBackDirective} from "../../../../../../../shared/directives/location-back.directive";

@Component({
    selector: 'app-upload-corp-roster',
    imports: [
        AccountRequisitesComponent,
        AccountSelectComponent,
        ContainerNavComponent,
        ContainerTitleComponent,
        FormsModule,
        MatFormField,
        MatIcon,
        MatInput,
        MatLabel,
        MatOption,
        MatRipple,
        MatSelect,
        MatSuffix,
        NgForOf,
        NgIf,
        NgOptimizedImage,
        NgxMaskDirective,
        ReactiveFormsModule,
        LocationBackDirective
    ],
    templateUrl: './upload-corp-roster.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadCorpRosterComponent implements OnInit{
  selectedFile = signal<File | null>(null)
  title = computed(() => `Загрузить свой реестр № ${this.docNum()} от ${this.docDate()}`)
  contractNumber = signal('')
  type = signal('')
  docNum = signal('')
  docDate = signal('')
  fileName = signal('')
  transitAccount = signal('')
  accounts = signal<AccountsDto[]>([])
  months = signal<{ key:string,value:number }[]>(MonthsForSalary)
  private _activatedRoute = inject(ActivatedRoute)
  private _accountsPaymentService = inject(AccountsPaymentsService)
  private _rightBarService = inject(RightBarService)
  #destroy = inject(DestroyRef)
  private _salaryService = inject(SalaryProjectService)
  private _utilsService = inject(UtilsService)
  private _toast = inject(ToastrService)
  private _router = inject(Router)
  isEditing = signal(false) ;
  changedDocNum = signal('') ;
  navs = computed(() =>
    [
      {
        title: 'Главная',
        link: '/'
      },

      {
        title: 'Корпоративные карты',
        link: '/corp-card-project/corp-cards'
      },
      {
        title: this.contractNumber(),
        link: `/corp-card-project/corp-cards/items/${this.transitAccount()}/${this.contractNumber()}/${this.type()}`
      },
      {
        title: `Загрузить свой реестр`,
        link: '/'
      },])

  uploadRosterForm = new FormGroup({
    salaryPrepareReq:new FormGroup({
      senderAccount: new FormControl('',Validators.required),
      docNum: new FormControl('',Validators.required),
      docDate: new FormControl('',Validators.required),
      cardUserType: new FormControl('CORPORATE',Validators.required),
      description: new FormControl('',Validators.required),
      contractNumber: new FormControl('',Validators.required),
      transitAccount: new FormControl('',Validators.required),
      month:new FormControl('',Validators.required),
      year:new FormControl('',Validators.required),
      reestrNumber:new FormControl('',Validators.required),
    })
  })

  ngOnInit(): void {
    this._activatedRoute.params.subscribe((params) => {
      if (params) {
        this.contractNumber.set(params['contractNumber'])
        this.transitAccount.set(params['transitAccount'])
        this.type.set(params['type'])
        this.uploadRosterForm.patchValue({
          salaryPrepareReq: {
            transitAccount: this.transitAccount(),
            contractNumber: this.contractNumber()
          }
        })

      }
    })
    this.getDocNum()
    this.getOperationDay()
    this.getAccountsList()
  }

  uploadExcelFile(event: any) {
    if (event.target.files) {
      console.log(event)
      let file: File | null = event.target.files[0]
      this.selectedFile.set(file)
      this.fileName.set(file!.name)
      event.target.value = null;
    }
  }
  removeFile() {
    this.selectedFile.set(null);
    this.fileName.set('');
  }

  getOperationDay() {
    this._rightBarService.getOperDay()
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe(val => {
        if (val) {
          this.docDate.set(val?.currentWorkingDate.toString())
          this.uploadRosterForm.patchValue({
            salaryPrepareReq: {
              docDate: this.docDate()
            }
          })
        }
      })
  }
  toggleEditMode() {
    this.isEditing.set(!this.isEditing())
    if(this.isEditing()) {
      this.changedDocNum.set(this.docNum())
    } else {
      this.changedDocNum.set('')
    }
  }
  saveDocNum() {
    console.log(this.changedDocNum())
    this.docNum.set(this.changedDocNum())
    this.uploadRosterForm.patchValue({
      salaryPrepareReq: {
        docNum: this.docNum()
      }
    })
    this.toggleEditMode();
  }
  setDocNum(event: Event) {
    this.changedDocNum.set((event.target as HTMLInputElement).value)
  }
  getDocNum() {
    this._accountsPaymentService.getTransactionDocNum()
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe(val => {
        if (val) {
          this.docNum.set(val.msg)

          this.uploadRosterForm.patchValue({
            salaryPrepareReq: {
              docNum: this.docNum()
            }
          })
        }
      })
  }

  getAccountsList() {
    this._accountsPaymentService.getPaymentAllowed({page: 0, size: 100}, {
      senderAccount: null,
      transactionMode: 'CORP_CARD_TOP_UP'
    }).subscribe(res => {
      if (!res) return;
      this.accounts.set(res.content)
    })
  }

  selectedSenderAccount(event: AccountsDto) {
    if (event.altAcctId){
      this.uploadRosterForm.patchValue({
        salaryPrepareReq: {
          senderAccount: event.altAcctId
        }
      })
    }
  }

  downloadExcelFile() {
    this._utilsService.spinnerState$$.next(true);
    this._salaryService.getSalaryExcelFile({
      page: 0,
      size: 500,
      userType: 'CORPORATE',
      transitAccount: this.transitAccount(),
      contractNumber: this.contractNumber()
    }).pipe(takeUntilDestroyed(this.#destroy)).subscribe(res => {
        if (res?.msg) {
          let link = document.createElement('a')
          link.setAttribute('type', 'hidden')
          link.href = res.msg
          document.body.appendChild(link);
          link.click();
          link.remove();
        }
      },
    )
  }
  uploadRosterSubmit() {
    if (this.selectedFile() && this.uploadRosterForm.valid) {
      this._utilsService.spinnerState$$.next(true);
      const salaryPrepareReq = this.uploadRosterForm.get('salaryPrepareReq')?.value || {};
      const queryParams: { [key: string]: string } = {};
      Object.entries(salaryPrepareReq).forEach(([key, value]) => {
        if (value) {
          queryParams[key] = value.toString();
        }
      });
      this._salaryService.uploadRosterSalary(this.selectedFile(), queryParams).pipe(
        takeUntilDestroyed(this.#destroy)
      ).subscribe({
        next: (res) => {
          if (Array.isArray(res)) {
            this._toast.success('Успешно');
            this._router.navigate(['/corp-card-project/corp-roster']);
          }
          this._utilsService.spinnerState$$.next(false);
        },
        error: () => {
          this._utilsService.spinnerState$$.next(false);
        }
      });
    }
  }
}
