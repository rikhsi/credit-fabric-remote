import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject, OnDestroy,
  OnInit,
  Output, signal
} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {ActivatedRoute, Router} from "@angular/router";
import {TransactionService} from "../../../core/services/transaction.service";
import { QRCodeComponent } from 'angularx-qrcode';
import {PaymentSignModalComponent} from "../payment-sign-modal/payment-sign-modal";
import {animate, style, transition, trigger} from "@angular/animations";
import {PaymentService} from "../../../core/services/payment.service";
import {SuccessModalComponent} from "../success-modal/success-modal";
import {UtilsService} from "../../../core/services/utils.service";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-payment-qr-modal',
  imports: [
    QRCodeComponent,
    NgIf,
  ],
  templateUrl: './payment-qr-modal.html',
  styleUrls: ['./payment-qr-modal.scss'],
  animations: [
    trigger('dialogAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.8)' }))
      ])
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PaymentQrModalComponent implements OnInit, OnDestroy {
  @Output() onDetail = new EventEmitter<string>();
  safePdfUrl!: SafeResourceUrl;
  qrLink: string = '';
  timer = 60;
  intervalId!: NodeJS.Timer;
  intervalRef: any;
  isCompleted = signal(false);
  tempId = signal('');
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<PaymentQrModalComponent>,
    private sanitizer: DomSanitizer,
    private utilsService: UtilsService,
    private transactionService: TransactionService,
    private cf: ChangeDetectorRef,
    private paymentService: PaymentService,
    private dialog: MatDialog,
    public router: Router,
    public route: ActivatedRoute,
  ) {
    this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.data);
  }

  ngOnInit() {
     this.intervalRef = setInterval(() => {
      this.check(false)
    }, 2000)
    this.getQrCode();
    this.startCounter();
  }

  ngOnDestroy() {
    clearInterval(this.intervalRef);
  }

  closeAction() {
    if (this.data.from === 'sign-history') {
    } else if (this.data.from === 'sign-payment') {
      this.router.navigate(['/history']);
    } else {
      this.router.navigate(['/']);
    }
    this.close();
  }

  startCounter(): void {
    if (this.timer === 0) {
      this.stopCounter();
      return;
    }
    this.intervalId = setInterval(() => {
      if (this.timer === 0) {
        this.stopCounter();
      } else {
        this.timer--
      }
      this.cf.detectChanges();
    }, 1000);
  }
  stopCounter(): void {
    this.intervalId && clearInterval(this.intervalId as any);
  }

  getQrCode(update?: boolean) {
    if (this.data.from === 'mass-payment') {
      this.transactionService.getQrForMassPayment({
        includeTransactions: this.data.includeTransactions,
        excludeTransactions: this.data.excludeTransactions,
        fileTransactionId: this.data.fileTransactionId,
      }).pipe()
        .subscribe((res: any) => {
          this.qrLink = res.qrLink
          this.tempId.set(res.qrLink.split('/').at(-1))
          this.cf.detectChanges();
        })
    } else {
      this.transactionService.getQrForPayment(this.data.transactionId).pipe()
        .subscribe((res: any) => {
          if (update) {
            this.timer = 60;
            this.startCounter();
          }
          this.qrLink = res.qrLink
          this.cf.detectChanges();
        })
    }
  }

  openPaymentSignModal() {
      this.dialog.open(PaymentSignModalComponent, {
        data: this.data,
        disableClose: true,
      });
      this.close();
  }

  check(loading: boolean = true) {
    if (loading) {
      this.utilsService.spinnerState$$.next(true);
    }
    // this.transactionService.getQrForPayment(this.data).pipe()
    //   .subscribe((res: any) => {
    //     console.log(res, "res")
    //     // this.qrLink = res.qrLink
    //     this.cf.detectChanges();
    //   })
    if (this.data.from === 'mass-payment') {
      this.paymentService.getTransactionPreErrorStatus(this.tempId()).pipe()
        .subscribe({
          next: (res: any) => {
            if (this.isCompleted()) {
              return clearInterval(this.intervalRef);
            }
            if (res?.status === "RECEIVED") {
              this.isCompleted.set(true);
              clearInterval(this.intervalRef);
              this.cf.detectChanges();
              this.close();
              this.dialog.open(SuccessModalComponent, {
                data: {
                  type: 'mass',
                  selectedAmount: this.data.selectedAmount
                },
                disableClose: true,
              }).afterClosed().subscribe(() => {
              })
              this.utilsService.spinnerState$$.next(false);
            }
          },
          error: () => {
            this.utilsService.spinnerState$$.next(false);
          }
        })
    } else {
      this.paymentService.getTransactionOne(this.data.transactionId).pipe()
        .subscribe({
          next: (res: any) => {
            if (this.isCompleted()) {
              return clearInterval(this.intervalRef);
            }
            if (res?.status === "IN_PROCESS" || res?.status === "SUCCESS") {
              this.isCompleted.set(true);
              clearInterval(this.intervalRef);
              this.onDetail.emit("sign");
              this.cf.detectChanges();
              this.dialog.open(SuccessModalComponent, {
                data: this.data.transaction,
                disableClose: true,
              })
              this.close();
              this.utilsService.spinnerState$$.next(false);
            }
          },
          error: () => {
            this.utilsService.spinnerState$$.next(false);
          }
        })
    }
  }

  close() {
    this.dialogRef.close();
    this.stopCounter()
  }

  protected readonly Math = Math;
}
