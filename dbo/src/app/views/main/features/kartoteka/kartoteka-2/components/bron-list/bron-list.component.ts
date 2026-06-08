import {Component, inject, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {NgIf} from "@angular/common";
import { TranslateModule } from '@ngx-translate/core';
import {AccountInfoDto} from "../../../../accounts-payments/models/accounts-payments.model";
import {TransactionDetailComponent} from "../../../../transaction-detail/transaction-detail.component";
import {MatDivider} from "@angular/material/divider";
import {Kartoteka2Store} from "../../../store/kartoteka2.store";

@Component({
  selector: 'app-bron-list',
  templateUrl: './bron-list.component.html',
  imports: [
    NgIf,
    TranslateModule,
    MatDivider
  ]
})
export class BronListComponent implements OnInit {
  public readonly account = signal<AccountInfoDto | null>(null)
  protected kartoteka2Store = inject(Kartoteka2Store)
  ngOnInit() {
  }

  protected formatMoney(value: number | string): { formattedInteger: any, decimal: any } {
    const num = Number(value);
    const [integer, decimal] = num.toFixed(2).split('.');
    const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    return { formattedInteger, decimal };
  }

  formatDate(createdAt: string): string {
    const [datePart] = createdAt.split(" ");
    const [day, month, year] = datePart.split(".");

    const months = [
      "января", "февраля", "марта", "апреля", "мая", "июня",
      "июля", "августа", "сентября", "октября", "ноября", "декабря"
    ];

    const monthName = months[parseInt(month, 10) - 1];

    return `${parseInt(day, 10)} ${monthName} ${year}`;
  }

  constructor(
    protected _matDialogRef: MatDialogRef<TransactionDetailComponent>,
    protected router: Router,
  ) {
  }

  getTimeFromISO(dateString: string): string {
    const date = new Date(dateString);

    const intl = new Intl.DateTimeFormat('ru-RU', {
      dateStyle: 'short',
    }).format(date);

    return `${intl}`;
  }

}
