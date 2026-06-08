import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {ContainerNavComponent} from "../../../../../../shared/components/container-nav/container-nav.component";
import {ContainerTitleComponent} from "../../../../../../shared/components/container-title/container-title.component";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {
  AccountsTableColumnsHeaders,
  CorpCardTransactionHistoryTableColumnsHeaders
} from "../../../accounts-and-payments/constants/table-columns";
import {
  ContainerTableComponent
} from "../../../../../../shared/components/common/container-table/container-table.component";
import {TableColumn} from "../../../../../../shared/interfaces/table.interface";
import {Transactions} from "../../../../../../../assets/constants/purpose.const";

@Component({
    selector: 'app-corp-card-transaction-history',
    imports: [
        ContainerNavComponent,
        ContainerTitleComponent,
        NgForOf,
        NgIf,
        NgClass,
        ContainerTableComponent
    ],
    templateUrl: './corp-card-transaction-history.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CorpCardTransactionHistoryComponent {
  transactionTabs = signal<string[]>(['Все', 'Входящие', 'Исходящие'])
  activeTransactions = signal<number>(0)
  tableColumns: TableColumn[] = CorpCardTransactionHistoryTableColumnsHeaders;
  navs = signal([
    {
      title: 'Главная',
      link: '/main'
    },
    {
      title: 'Корпоративные карты',
      link: '/corp-cards'
    },
    {
      title: 'История операций',
      link: ''
    },
  ]);
  private _dialog = inject(MatDialog)
  protected readonly Transactions = Transactions;
}
