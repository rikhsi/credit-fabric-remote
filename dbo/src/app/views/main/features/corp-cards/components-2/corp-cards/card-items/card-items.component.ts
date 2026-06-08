import {ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {ContainerNavComponent} from "../../../../../../../shared/components/container-nav/container-nav.component";
import {
    ContainerTableComponent
} from "../../../../../../../shared/components/common/container-table/container-table.component";
import {
    ContainerTitleComponent
} from "../../../../../../../shared/components/container-title/container-title.component";
import {
    FilterButtonComponent
} from "../../../../../../../shared/components/common/filter-button/filter-button.component";
import {MatIcon} from "@angular/material/icon";
import {MatRipple} from "@angular/material/core";
import {NgOptimizedImage} from "@angular/common";
import {PaginatorComponent} from "../../../../../../../shared/components/paginator/paginator.component";
import {TableActionsComponent} from "../../../../../../../shared/components/table-actions/table-actions.component";
import {
  PayrollProjectResponseContent
} from "../../../../payroll-project/models/payroll-project.type";
import {TableColumn} from "../../../../../../../shared/interfaces/table.interface";
import {
  CorpCardsTableColumnsHeaders,
  EmployeeCardsTableColumnsHeaders
} from "../../../../payroll-project/constants/table-columns";
import {TableButton} from "../../../../../../../shared/interfaces/table-button.interface";
import {ActivatedRoute, Router} from "@angular/router";
import {SalaryProjectService} from "../../../../../../../core/services/salary-project.service";
import {UtilsService} from "../../../../../../../core/services/utils.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {corpCardsItemTableButton} from "../../../models/table-btn";
import {
  PayrollProjectEmployeesCardFilterComponent
} from "../../../../../../../shared/components/payroll-project-employees-card-filter/payroll-project-employees-card-filter.component";

@Component({
    selector: 'app-card-items',
    imports: [
        ContainerNavComponent,
        ContainerTableComponent,
        ContainerTitleComponent,
        FilterButtonComponent,
        MatIcon,
        MatRipple,
        NgOptimizedImage,
        PaginatorComponent,
        TableActionsComponent,
        PayrollProjectEmployeesCardFilterComponent
    ],
    templateUrl: './card-items.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardItemsComponent implements OnInit{
  filter = signal<any>('')
  filterState = signal(false)
  pageIndex = signal<number>(0)
  pageSize = signal<number>(20)
  isLoading = signal<boolean>(false)
  contractNumber = signal('')
  type = signal('')
  transitAccount = signal('')
  errorMessage = signal('')
  totalItems = signal<number>(0)
  selectedRows = signal<PayrollProjectResponseContent[]>([])
  employeeCards = signal<PayrollProjectResponseContent[]>([])
  tableColumns = signal<TableColumn[]>(CorpCardsTableColumnsHeaders)
  tableActionBtns = signal<TableButton[]>(corpCardsItemTableButton)

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
        link: '/'
      },])

  private _activatedRoute = inject(ActivatedRoute)
  private _salaryService = inject(SalaryProjectService)
  #destroy = inject(DestroyRef)
  private _router  = inject(Router)
  private _utilsService  = inject(UtilsService)


  ngOnInit(): void {
    this._activatedRoute.params.subscribe((params) => {
      if (params) {
        this.contractNumber.set(params['contractNumber'])
        this.transitAccount.set(params['transitAccount'])
        this.type.set(params['type'])
        this.getCardsOfEmployees()
      }
    })
  }


  getCardsOfEmployees() {
    this.isLoading.set(true)
    this._salaryService.getAllPayrollProjectList(
      {
        page: this.pageIndex(),
        size: this.pageSize(), userType: 'CORPORATE',
        contractNumber: this.contractNumber(),
        transitAccount: this.transitAccount(),
        updateBalance:false,
        ...this.filter()
      })
      .pipe(takeUntilDestroyed(this.#destroy)).subscribe(res => {
      if (!res) return
      this.errorMessage.set('')
      this.pageSize.set(res.pageable.pageSize)
      this.pageIndex.set(res.pageable.pageNumber)
      this.totalItems.set(res.totalElements)
      const maskedCards = res.content.map(card => ({
        ...card,
        pan: this.formatCardNumber(card.pan),
        expiryDate:this.formatExpireDate(card.expiryDate)
      }))
      this.employeeCards.set(maskedCards)
      this.isLoading.set(false)
    })
  }

  formatCardNumber(cardNumber: string): string {
    if (!cardNumber) return '';
    return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  onSelectedRows(rows: PayrollProjectResponseContent[]) {
    this.selectedRows.set(rows)
    this.toggleForAnyElement()
    this.tableActionBtns.set([...this.tableActionBtns()])
  }
  toggleForAnyElement() {
    if (this.selectedRows().length) {
      this.tableActionBtns().forEach(el => {
        if(el.id === 'corp-card-top-up' || el.id === 'exclude-corp-card'){
          el.active = true
        }
      });
    } else {
      this.tableActionBtns().forEach(el => {
        if(el.id === 'corp-card-top-up' || el.id === 'exclude-corp-card'){
          el.active = false
        }
      })
    }
  }
  onActionClick(id: string) {
    switch (id) {
      case 'add-corp-card-roaster':
        return this.navigateToCreateNewRoaster()
      case 'upload-corp-card-roaster':
        return this.navigateToUploadRoaster()
      case 'corp-card-top-up':
        return this.navigateToTopUpCard()
    }
  };

  syncEmployeeCards() {
    this._utilsService.spinnerState$$.next(true)
    this._salaryService.syncAllPayrollProjectList({
      page: this.pageIndex(),
      size: this.pageSize(), userType: 'CORPORATE',
      contractNumber: this.contractNumber(),
      transitAccount: this.transitAccount()
    }).pipe(takeUntilDestroyed(this.#destroy)).subscribe(res => {
      if (!res) return
      this._utilsService.spinnerState$$.next(false)
      this.getCardsOfEmployees()
    })
  }


  navigateToCreateNewCardEmployee(){
    this._router.navigate(['corp-card-project/corp-cards/items/create'],{queryParams:{transitAccount:this.transitAccount(),contractNumber:this.contractNumber(),type:this.type()}})
  }
  navigateToCreateNewRoaster(){
    this._router.navigate(['corp-card-project/corp-cards/roster/create',this.transitAccount(),this.contractNumber(),this.type()])
  }
  navigateToTopUpCard(){
    const selectedRowsCompact = this.selectedRows().map((row)=>row.uuid).join('-');
    this._router.navigate(['corp-card-project/corp-cards/roster/top-up',this.transitAccount(),this.contractNumber(),selectedRowsCompact,this.type()])
  }
  navigateToUploadRoaster(){
    this._router.navigate(['corp-card-project/corp-cards/roster/upload',this.transitAccount(),this.contractNumber(),this.type()])
  }
  pageChange(value: any) {
    this.pageIndex.set(+value?.page)
    this.pageSize.set(+value?.size)
    this.getCardsOfEmployees();
  }

  formatExpireDate(expiry:string){
    return  expiry ? expiry.slice(0, 2) + '/' +expiry.slice(2) : '';
  }
  setFilter(filter:any){
    this.filter.set(filter)
    this.pageIndex.set(0)
    this.getCardsOfEmployees()
  }
  refreshFilter(reset:any){
    this.filter.set(reset)
    this.pageIndex.set(0)
    this.getCardsOfEmployees()
  }

}
