import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output, signal,
  TemplateRef
} from '@angular/core';
import {TableColumn} from '../../../interfaces/table.interface';
import {NgClass, NgIf, NgTemplateOutlet} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {getStatusApplication, getStatusApp} from '../../../../core/utils/mixin.utils';
import {tableActionBtns} from '../../../../views/main/features/operations/utils/btn.state';
import {AmountService} from '../../../../core/services/amount.service';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {MatDialog} from "@angular/material/dialog";
import {TransactionService} from "../../../../core/services/transaction.service";
import {Subject, takeUntil} from "rxjs";
import {
  TransactionDetailComponent
} from "../../../../views/main/features/transaction-detail/transaction-detail.component";

@Component({
  selector: 'app-container-table',
  imports: [
    NgIf,
    NgTemplateOutlet,
    NgClass,
    FormsModule
  ],
  templateUrl: './container-table.component.html',
  styles: ``,
  styleUrls: ['./container-table.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContainerTableComponent implements OnDestroy {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() loading = false;
  @Output() selectedRows = new EventEmitter<any[]>();
  @Output() rowClicked = new EventEmitter();
  @Input() custom = false;
  @Input() type = 'PAYMENT_TEMPLATE';
  @Input() actionTemplate!: TemplateRef<any>;
  @Input() additionalTemplate!: TemplateRef<any>;
  @Input() size = 10;
  @Input() errorMessage = '';
  @Input() numbering = false;
  @Input() isTotal = false;
  @Input() checkable = true;

  @Input() statusType = 'DEFAULT';

  isAllSelected: boolean = false;

  private unsub$ = new Subject<void>();

  constructor(
    private amountService: AmountService,
    private matDialog: MatDialog,
    private transactionService: TransactionService,
    private destroyRef: DestroyRef,
  ) {
  }

  transactionHistory = signal<any>([])

  toggleSelectAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.isAllSelected = checked;
    this.data.forEach(row => (row.selected = checked));
    this.getSelectedRows();
  }

  ngOnDestroy() {
    this.selectedRows.emit([]);
  }

  toggleRowSelection(row: any): void {
    row.selected = !row.selected;
    this.updateSelectAll();
  }

  onClickRow(row: any): void {
    this.rowClicked.emit(row);
    this.openTransactionDetail(row.id, row.documentEnum);
  }

  updateSelectAll() {
    this.isAllSelected = this.data.every(row => row.selected);

    this.getSelectedRows();
  }

  getSelectedRows() {
    const selectedData = this.data.filter(row => row.selected);
    this.selectedRows.emit(selectedData);
  }

  getNestedValue(obj: any, path: string) {
    let data = path.split('.').reduce((o, key) => (o ? o[key] : null), obj);
    if (path === 'absStatus' || path == 'status' || path == 'state') {
      const res = obj['absStatus'] ? getStatusApplication(obj['absStatus'], this.statusType).label : getStatusApplication(data, this.statusType).label
      data = obj['fromAbs'] ? '' : res;
    }
    if (path === 'applicationStatus') {
      const res = obj['absStatus'] ? getStatusApp(obj['absStatus']).label : getStatusApp(data).label
      data = obj['fromAbs'] ? '' : res;
    }
    if (path === 'docDate' || path === 'createdDate') {
      if (data !== null && data.length > 11) {
        data = new Date(data).toLocaleDateString('ru-Ru', {day: 'numeric', month: 'numeric', year: 'numeric'})
      }
    }
    if (data === '') return '';
    if (path.includes('percent')) {
      return `${data}%`;
    }
    if (path === 'balance' || path == 'saldoUnlead.amount') {
      data = this.amountService.convertToAmount(obj.balance?.amount);
    }
    if (path === 'conversionApplicationDto.senderAmount') {
      data = this.conversionApplicationAmount(obj.conversionApplicationDto.senderAmount);
    }
    if (path === 'conversionApplicationDto.receiverAmount') {
      data = this.conversionApplicationAmount(obj.conversionApplicationDto.receiverAmount);
    }
    if (path.includes('senderAmount32')) {
      data = this.swiftApplicationAmount(obj);
    }
    if (path === 'senderAmount') {
      data = this.amountService.convertToAmount(+obj.senderAmount?.amount);
    }
    if (path === 'transaction.senderAmount.amount') {
      data = this.amountService.convertToAmount(+obj.transaction?.senderAmount?.amount);
    }
    if (path === 'amount' || path === 'amount.amount' || path == 'sumSaldo' || path == 'interestOnTermDebt'
      || path == 'sumPaid'
      || path == 'sumRest'
      || path == 'summa'
      || path == 'sumUnlead'
      || path == 'sumDoc'
      || path == 'saldoObAcc'
      || path == 'sumNeed'
      || path == 'sumNeedPay'
      || path == 'sumNeedPaid'
      || path == 'sumNeedUnl'
      || path == 'sumReserved'
    ) {
      data = this.amountService.convertToAmount(data)
    }
    if (data === 'Итого') {
      return data;
    }
    if (
      path.includes('depSaldo') ||
      path === 'percSaldo'
    ) {
      data = this.amountService.convertToAmount(+obj.depSaldo.amount);
    }
    if (
      path === 'fullAmount.amount' ||
      path === 'totalAmount.amount' ||
      path === 'saldo.amount' ||
      path == 'recommendedAmount'
    ) {
      data = this.amountService.convertToAmount(+data)
    }
    if (path.includes('rate')) {
      data = this.convertRateToNumber(obj.conversionApplicationDto);
    }
    return data;
  }

  getClassNames(obj: any, path: string) {
    let data = path.split('.').reduce((o, key) => (o ? o[key] : null), obj);
    if (path === 'absStatus' || path === 'applicationStatus' || path == 'status' || path == 'state') {
      const status = obj['absStatus'] || data;
      return `${getStatusApplication(status, this.statusType).text}`
    }
    return '';
  }

  swiftApplicationAmount(obj: any): string {
    const amountProp = obj?.swiftApplicationDto ? obj?.swiftApplicationDto?.senderAmount32 : obj?.conversionApplicationDto?.senderAmount
    const amount = Number(amountProp);
    const integerPart = this.separateNumberByThree(Math.floor(amount / 100));
    const fractionalPart = `${amount % 100}`.padStart(2, '0');
    return `${integerPart},${fractionalPart}`;
  }

  conversionApplicationAmount(amount: number): string {
    const integerPart = this.separateNumberByThree(Math.floor(amount / 100));
    const fractionalPart = `${amount % 100}`.padStart(2, '0');
    return `${integerPart},${fractionalPart}`;
  }

  convertRateToNumber(obj: any): string {
    const integerPart = this.separateNumberByThree(Math.floor(obj?.rate / 10000));
    const fractionalPart = `${obj?.rate % 10000}`.padStart(2, '0').slice(0, 2);
    return `${integerPart},${fractionalPart}`;
  }

  separateNumberByThree(value: string | number): string {
    const strValue = value.toString();

    return strValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  getStatusApplicationDotColor(obj: any, path: string): string | null {
    let status;
    if (['absStatus', 'status', 'state'].includes(path)) {
      status = obj['absStatus'] || obj[path];
      return getStatusApplication(status, this.statusType).color;
    }
    if (path === 'applicationStatus') {
      status = obj['absStatus'] || obj[path];
      return getStatusApp(status).color;
    }
    return null;
  }

  openTransactionDetail(id: string, type: 'PAYMENT' | 'BUDGET') {
    if (id) {
      this.transactionService[type === "PAYMENT" ? "getTransactionDetail" : "getBudgetDetail"](id).pipe(takeUntil(this.unsub$)).subscribe((res) => {
        if (res) {
          this.matDialog.open(TransactionDetailComponent, {
            width: '475px',
            height: '100%',
            position: {right: '0'},
            panelClass: 'right-side-dialog',
            data: res
          });
        }
      })
    }
  }


  protected readonly tableActionBtns = tableActionBtns;
}
