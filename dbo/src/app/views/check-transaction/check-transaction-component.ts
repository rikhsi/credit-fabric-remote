import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {TransactionService} from "../../core/services/transaction.service";


@Component({
  selector: 'app-check-transaction-component',
  templateUrl: './check-transaction-component.html',
  styles: ``,
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckTransactionComponent implements OnInit {
  transactionInfo!: any;

  transactionId='';
  constructor(
    private route: ActivatedRoute,
    private transactionService: TransactionService,
    private cdr: ChangeDetectorRef
  ) {
  }
  ngOnInit() {
    this.initLoanId()
  }
  initLoanId() {
    this.transactionId = this.route.snapshot.queryParams['id'] || '';

    if (!this.transactionId) return;


    this.transactionService.getCheckTransaction(this.transactionId).subscribe(val => {
        this.transactionInfo = val?.result?.data || {};
        this.cdr.markForCheck();
      })

  }
  get formattedDate() {
    return this.transactionInfo?.docDate
      ? new Date(this.transactionInfo.docDate).toLocaleDateString('uz-UZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
      : '';

  }

  get senderAmount() {
    const amount = this.transactionInfo?.senderAmount?.amount ?  this.transactionInfo?.senderAmount?.amount / 100 : 0;
    const currency = this.transactionInfo?.senderAmount?.currency

    if (amount == null) return '';

    const num = amount.toFixed(2);
    const parts = num.split('.');
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `${intPart}.${parts[1]} ${currency}`;
  }

  get receiverAmount() {
    const amount = this.transactionInfo?.receiverAmount?.amount ?  this.transactionInfo.receiverAmount?.amount / 100 : 0;
    const currency = this.transactionInfo?.receiverAmount?.currency;

    if (amount == null) return '';

    const num = amount.toFixed(2);
    const parts = num.split('.');
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `${intPart}.${parts[1]} ${currency}`;
  }

  protected readonly Number = Number;
}
