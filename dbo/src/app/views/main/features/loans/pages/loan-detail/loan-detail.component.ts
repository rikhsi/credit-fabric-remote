import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import { NgxMaskPipe } from "ngx-mask";
import {ActivatedRoute, RouterLink, RouterLinkActive} from "@angular/router";
import {NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { TableFiltersComponent } from '../../../../../../shared/components/table-filters/table-filters.component';
import { LoanDetailDialogComponent } from '../../ui/loan-detail-dialog/loan-detail-dialog.component';
import { LoanTermsComponent } from '../../ui/loan-terms/loan-terms.component';
import { LoanPaymentDetailDialogComponent } from '../../ui/loan-payment-detail-dialog/loan-payment-detail-dialog.component';
import { PageLayoutComponent } from "../../../../../../shared/components/page-layout/page-layout.component";
import { FilterConfig } from "../../../../../../shared/components/table-filters/table-filters.model";
import {Loan} from "../../models/loan.model";

@Component({
  selector: 'app-loan-detail',
  imports: [
    NgxMaskPipe,
    RouterLink,
    TableFiltersComponent,
    NgOptimizedImage,
    MatMenu,
    MatMenuTrigger,
    NgForOf,
    PageLayoutComponent,
    NgIf
  ],
  templateUrl: './loan-detail.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanDetailComponent implements OnInit {
  readonly matDialog = inject(MatDialog);
  readonly route = inject(ActivatedRoute);

  readonly loanDetails = signal<Loan | Record<string, any>>({});

  ngOnInit() {
    const loanDetails =  localStorage.getItem('loanData')
    if (loanDetails) {
      this.loanDetails.set(JSON.parse(loanDetails))
    }
    // this.route.queryParams.subscribe(params => {
    //   this.loanDetails.set(JSON.parse(params['data'] || null));
    // });
  }

  integerPart(balance): string {
    const separator = balance.scale === 3 ? 1000 : balance.scale === 2 ? 100 : balance.scale === 1 ? 10 : 1;
    const amount = (balance.amount ?? 0) / separator;
    const [int] = amount.toFixed(2).split('.');
    return Number(int).toLocaleString().replace(/,/g, ' ');
  }

  decimalPart(balance): string {
    const separator = balance.scale === 3 ? 1000 : balance.scale === 2 ? 100 : balance.scale === 1 ? 10 : 1;
    const amount = (balance.amount ?? 0) / separator;
    const [, dec] = amount.toFixed(2).split('.');
    return dec;
  }
  
  tabs = [
    { title: 'Все', value: 'loans-my' },
    { title: 'На подпись', value: 'loans-closed' },
  ];

  public readonly filterConfig: FilterConfig[] = [
    { name: 'search', type: 'search', placeholder: 'Поиск' },
    {
      name: 'currency',
      type: 'select',
      placeholder: 'Счет',
      options: [
        { label: 'ISHONCH PLAST MONTAJ MCHJ', value: 'UZS' },
        { label: 'ISHONCH PLAST MONTAJ MCHJ', value: 'UZD' },
      ]
    },
    {
      name: 'currency',
      type: 'select',
      placeholder: 'Тип Транзакции',
      options: [
        { label: 'ISHONCH PLAST MONTAJ MCHJ', value: 'UZS' },
        { label: 'ISHONCH PLAST MONTAJ MCHJ', value: 'UZD' },
      ]
    },
    {
      name: 'status',
      type: 'select',
      placeholder: 'Статус',
      options: [
        { label: 'Активный', value: 'ACTIVE' },
        { label: 'Просроченный', value: 'EXPIRED' },
      ]
    },
    {
      name: 'currency',
      type: 'select',
      placeholder: 'Период',
      options: [
        { label: 'Вчера', value: 'UZS'},
        { label: 'Сегодня', value: 'UZD'},
      ]
    },
  ];

  data = {
    "timestamp": 1760595062471,
    "success": true,
    "result": {
      "code": 20200,
      "message": "OK",
      "audit": "e7af1993-ea4f-4224-a982-c078aa04c19a",
      "data": {
        "id": 33813035,
        "accountNumberCard": "20208000204899265001",
        "holderInfo": "ISHONCH PLAST MONTAJ MCHJ",
        "balance": {
          "amount": 146230390173,
          "scale": 2,
          "currency": "UZS",
          "logo": null
        },
        "mfo": "09012",
        "filialName": "Г.АHДИЖАH,АКЦИОH.КОМБАHК \"ХАМКОРБАHК\"                                        ХМБ",
        "inn": "301528306",
        "openDate": "18.11.2022",
        "accountType": "Кредит Бизнес Плюс",
        "accountTitle": "ISHONCH PLAST MONTAJ MCHJ",
        "active": true
      }
    }
  }

  openDialogDetail(){
    this.matDialog.open(LoanDetailDialogComponent, {
      data: this.loanDetails(),
      width: '475px',
      height: 'calc(100% - 16px)',
      position: {
        right: '0',
      },
      panelClass: 'right-side-dialog',
    })
  }

  openDialogTerms(){
    this.matDialog.open(LoanTermsComponent, {
      data: this.loanDetails(),
      width: '475px',
      height: 'calc(100% - 16px)',
      position: {
        right: '0',
      },
      panelClass: 'right-side-dialog',
    })
  }

  openDialogPaymentDetail(){
    this.matDialog.open(LoanPaymentDetailDialogComponent, {
      width: '475px',
      height: 'calc(100% - 16px)',
      position: {
        right: '0',
      },
      panelClass: 'right-side-dialog',
    })
  }

  protected readonly Number = Number;
}
