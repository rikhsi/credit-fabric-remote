import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { AccountsDto } from "../../../../accounts-payments/models/accounts-payments.model";
import { TableColumn } from "../../../../../../../shared/interfaces/table.interface";
import { EmployeeCardsTableColumnsHeaders } from "../../../../payroll-project/constants/table-columns";
import { TableButton } from "../../../../../../../shared/interfaces/table-button.interface";
import { employeesCardsTableButton } from "../../../../payroll-project/constants/table-btn";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AccountsPaymentsService } from "../../../../accounts-payments/services/accounts-payments.service";
import { RightBarService } from "../../../../../right-bar/services/right-bar.service";
import { SalaryProjectService } from "../../../../../../../core/services/salary-project.service";
import { UtilsService } from "../../../../../../../core/services/utils.service";
import { ToastrService } from "ngx-toastr";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  AccountRequisitesComponent
} from "../../../../../../../shared/components/account-requisites/account-requisites.component";
import { AccountSelectComponent } from "../../../../../../../shared/components/account-select/account-select.component";
import { ContainerNavComponent } from "../../../../../../../shared/components/container-nav/container-nav.component";
import {
  ContainerTitleComponent
} from "../../../../../../../shared/components/container-title/container-title.component";
import { DecimalPipe, NgForOf, NgIf, NgOptimizedImage } from "@angular/common";
import {
  FilterButtonComponent
} from "../../../../../../../shared/components/common/filter-button/filter-button.component";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatIcon } from "@angular/material/icon";
import { MatInput } from "@angular/material/input";
import { MatOption } from "@angular/material/autocomplete";
import { MatSelect } from "@angular/material/select";
import { NgxMaskDirective } from "ngx-mask";
import { LocationBackDirective } from "../../../../../../../shared/directives/location-back.directive";
import { AccountService } from "../../../../../../../core/services/account.service";

@Component({
  selector: 'app-top-up-corp-card',
  imports: [
    AccountRequisitesComponent,
    AccountSelectComponent,
    ContainerNavComponent,
    ContainerTitleComponent,
    DecimalPipe,
    FilterButtonComponent,
    FormsModule,
    MatFormField,
    MatIcon,
    MatInput,
    MatLabel,
    MatOption,
    MatSelect,
    NgForOf,
    NgOptimizedImage,
    NgxMaskDirective,
    ReactiveFormsModule,
    NgIf,
    LocationBackDirective
  ],
  templateUrl: './top-up-corp-card.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopUpCorpCardComponent implements OnInit {
  filterState = signal(false)
  pageIndex = signal<number>(0)
  pageSize = signal<number>(20)
  isLoading = signal<boolean>(false)
  contractNumber = signal('')
  type = signal('')
  uuid = signal('')
  docNum = signal('')
  docDate = signal('')
  transitAccount = signal('')
  accounts = signal<any[]>([])
  errorMessage = signal('')
  totalItems = signal<number>(0)
  tableColumns = signal<TableColumn[]>(EmployeeCardsTableColumnsHeaders)
  tableActionBtns = signal<TableButton[]>(employeesCardsTableButton)
  title = computed(() => `Платежное поручение  № ${this.docNum()} от ${this.docDate()}`)
  isEditing = signal(false);
  changedDocNum = signal('');
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
        title: `Пополнить`,
        link: '/'
      },])
  totalAmount = new FormControl<number>(0)
  private _activatedRoute = inject(ActivatedRoute)
  private _accountsPaymentService = inject(AccountsPaymentsService)
  private _router = inject(Router)
  private _rightBarService = inject(RightBarService)
  #destroy = inject(DestroyRef)
  private _salaryService = inject(SalaryProjectService)
  private fb = inject(FormBuilder)
  private _utilService = inject(UtilsService)
  private _toast = inject(ToastrService)
  private readonly accountService = inject(AccountService)

  createRosterForm = new FormGroup({
    salaryPrepareReq: new FormGroup({
      senderAccount: new FormControl('', Validators.required),
      docNum: new FormControl('', Validators.required),
      docDate: new FormControl('', Validators.required),
      cardUserType: new FormControl('CORPORATE', Validators.required),
      description: new FormControl(''),
      contractNumber: new FormControl('', Validators.required),
      transitAccount: new FormControl('', Validators.required),
      reestrNumber: new FormControl('', Validators.required),
    }),
    employeesItems: new FormArray<FormGroup>([])
  })


  ngOnInit(): void {
    this._activatedRoute.params.subscribe((params) => {
      if (params) {
        this.contractNumber.set(params['contractNumber'])
        this.transitAccount.set(params['transitAccount'])
        this.type.set(params['type'])
        this.uuid.set(params['uuid'])
        this.createRosterForm.patchValue({
          salaryPrepareReq: {
            contractNumber: this.contractNumber(),
            transitAccount: this.transitAccount(),
          }
        })
      }
    })
    this.getDocNum()
    this.getOperationDay()
    this.getAccounts1()
    this.getCardsOfEmployees()
    this.employeeList.valueChanges.subscribe(() => {
      this.totalAmount.setValue(this.calculateTotalAmount(), { emitEvent: false });
    });
  }

  toggleEditMode() {
    this.isEditing.set(!this.isEditing())
    if (this.isEditing()) {
      this.changedDocNum.set(this.docNum())
    } else {
      this.changedDocNum.set('')
    }
  }

  saveDocNum() {
    console.log(this.changedDocNum())
    this.docNum.set(this.changedDocNum())
    this.createRosterForm.patchValue({
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
          this.createRosterForm.patchValue({
            salaryPrepareReq: {
              docNum: this.docNum()
            }
          })
        }
      })
  }

  getOperationDay() {
    this.accountService.getOperDayNew()
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe(val => {
        if (val) {

          this.docDate.set(val?.operDay.toString())
          console.log(this.docDate())
          this.createRosterForm.patchValue({
            salaryPrepareReq: {
              docDate: this.docDate()
            }
          })
        }
      })
  }

  getAccountsList() {
    this._accountsPaymentService.getPaymentAllowed({ page: 0, size: 100 }, {
      senderAccount: null,
      transactionMode: 'CORP_CARD_TOP_UP'
    }).subscribe(res => {
      if (!res) return;
      this.accounts.set(res.content)
    })
  }

  getAccounts1() {
    this.accountService.getAccountListV2({
      size: 100,
      page: 0
    }, {}).pipe(takeUntilDestroyed(this.#destroy)).subscribe(accounts => {
      if (accounts) {
        this.accounts.set(accounts.content.filter(account => account.codeCurrency === "000"))
      }
    })
  }

  selectedSenderAccount(event: AccountsDto) {
    if (event) {
      this.createRosterForm.patchValue({
        salaryPrepareReq: {
          senderAccount: event.altAcctId
        }
      })
    }

  }

  get employeeList(): FormArray {
    return this.createRosterForm.get('employeesItems') as FormArray
  }

  getAmountTransferToCardControl(index: number): FormControl {
    return (this.employeeList.at(index) as FormGroup).get('amountTransferToCard') as FormControl;
  }

  getCardsOfEmployees() {
    this.isLoading.set(true);
    this._salaryService.getAllPayrollProjectList({
      page: this.pageIndex(),
      size: this.pageSize(),
      userType: 'CORPORATE',
      contractNumber: this.contractNumber(),
      transitAccount: this.transitAccount(),
      updateBalance: false,
    })
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe(res => {
        if (!res) return;

        this.errorMessage.set('');
        this.pageSize.set(res.pageable.pageSize);
        this.pageIndex.set(res.pageable.pageNumber);
        this.totalItems.set(res.totalElements);
        const filteredContent = res.content.filter(card => card.uuid === this.uuid());

        const employeesItems = filteredContent.map((card) => {
          const maskedPan = card.pan.replace(/(\d{4})(\d{2})(\*{6})(\d{4})/, '$1 $2****** $4');
          const formattedExpiryDate = card.expiryDate ? card.expiryDate.slice(0, 2) + '/' + card.expiryDate.slice(2) : '';
          return this.fb.group({
            fio: [card.ownerName],
            accountNumberCard: [card.account],
            amountTransferToCard: [null],
            pan: [maskedPan],
            expiryDate: [formattedExpiryDate]
          });
        });

        this.createRosterForm.setControl('employeesItems', this.fb.array(employeesItems));
        this.isLoading.set(false);
      });
  }


  calculateTotalAmount(): number {
    return this.employeeList.controls.reduce((total, employeeFormGroup) => {
      const amount = employeeFormGroup.get('amountTransferToCard')?.value || 0;
      return total + parseFloat(amount);
    }, 0);
  }

  loadMoreCards() {
    if (this.pageIndex() >= Math.ceil(this.totalItems() / this.pageSize())) return;

    this.isLoading.set(true);
    this._salaryService.getAllPayrollProjectList({
      page: this.pageIndex() + 1,
      size: this.pageSize(),
      userType: 'SALARY',
      contractNumber: this.contractNumber(),
      transitAccount: this.transitAccount(),
    }).pipe(takeUntilDestroyed(this.#destroy))
      .subscribe(res => {
        if (!res) return;

        this.pageIndex.set(res.pageable.pageNumber);
        this.totalItems.set(res.totalElements);
        const filteredContent = res.content.filter(card => card.uuid === this.uuid());

        const newEmployees = filteredContent.map((card) => {
          const maskedPan = card.pan.replace(/(\d{4})(\d{2})(\*{6})(\d{4})/, '$1 $2****** $4');
          const formattedExpiryDate = card.expiryDate ? card.expiryDate.slice(0, 2) + '/' + card.expiryDate.slice(2) : '';
          return this.fb.group({
            fio: [card.ownerName],
            accountNumberCard: [card.account],
            amountTransferToCard: [null],
            pan: [maskedPan],
            expiryDate: [formattedExpiryDate],
          });
        });

        const currentControls = this.employeeList.controls;
        // @ts-ignore
        this.createRosterForm.setControl(
          'employeesItems',
          this.fb.array([...currentControls, ...newEmployees]),
        );

        this.isLoading.set(false);
      });
  }

  onScroll(event: Event): void {
    const element = event.target as HTMLElement;

    const tolerance = 1;
    const scrollTop = Math.floor(element.scrollTop);
    const scrollHeight = Math.floor(element.scrollHeight);
    const clientHeight = Math.floor(element.clientHeight);

    const atBottom = Math.abs(scrollHeight - scrollTop - clientHeight) <= tolerance;
    if (atBottom && !this.isLoading()) {
      this.loadMoreCards();
    }
  }

  formSubmit() {
    if (this.createRosterForm.valid) {
      const formValue = this.createRosterForm.value;
      const employeesWithoutExtraFields = formValue.employeesItems?.map((employee: any) => {
        const { pan, expiryDate, amountTransferToCard, ...filteredEmployee } = employee;
        return {
          ...filteredEmployee,
          amountTransferToCard: amountTransferToCard ?? 0
        };
      });

      const requestPayload = {
        ...formValue,
        employeesItems: employeesWithoutExtraFields,
      };

      this._utilService.spinnerState$$.next(true);
      this._salaryService.createRoster(requestPayload)
        .pipe(takeUntilDestroyed(this.#destroy))
        .subscribe(res => {
          if (!res) return this._utilService.spinnerState$$.next(false);
          this._utilService.spinnerState$$.next(false);
          this._toast.success('Успешно');
          this._router.navigate(['/corp-card-project/corp-roster']);
        });
    }
  }

}
