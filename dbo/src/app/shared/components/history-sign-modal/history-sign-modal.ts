import {ChangeDetectionStrategy, Component, EventEmitter, Inject, OnInit, Output, output} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {Router} from "@angular/router";
import {PaymentQrModalComponent} from "../payment-qr-modal/payment-qr-modal";
import {animate, style, transition, trigger} from "@angular/animations";
import {EspSignConfirmComponent} from "../../../core/components/esp-sign-confirm/esp-sign-confirm.component";

@Component({
  selector: 'app-history-sign-modal',
  templateUrl: './history-sign-modal.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
})

export class HistorySignModalComponent implements OnInit {
  safePdfUrl!: SafeResourceUrl;
  @Output() onDetail = new EventEmitter<string>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<HistorySignModalComponent>,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog,
    public router: Router,
  ) {
    this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.data);
  }

  ngOnInit() {
  }

  qrDialog() {
    const dialog = this.dialog.open(PaymentQrModalComponent, {
      data: this.data.transactionId === 'mass' ? {
        includeTransactions: this.data.action.massivePaymentData.includeTransactions,
        excludeTransactions: this.data.action.massivePaymentData.excludeTransactions,
        fileTransactionId: this.data.action.massivePaymentData.fileTransactionId,
        from: 'mass-payment',
        selectedAmount: this.data.selectedAmount
      } : {...this.data, from: "sign-history"},
      disableClose: true,
    })

    dialog.componentInstance.onDetail.subscribe(() => {
      this.onDetail.emit('sign');
      dialog.close();
    });
    dialog.afterClosed().subscribe(() => {
      this.close();
    });
    this.close();
  }

  espDialog() {
    this.dialog.open(EspSignConfirmComponent, {
      width: '560px',
      data: this.data.transactionId === 'mass' ? { action: this.data } : {
        action: {
          ...this.data.action,
          from: "sign-history",
        },
        transition: this.data.transaction
      },
    }).afterClosed()
      .subscribe({
        next: res => {
          if (res === 'update') {
            this.onDetail.emit('sign')
          }
        }
      });
    this.close();
  }

  close() {
    this.dialogRef.close();
  }

  protected readonly Math = Math;
}
