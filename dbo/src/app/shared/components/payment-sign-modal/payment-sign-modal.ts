import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {Router} from "@angular/router";
import {NgxMaskPipe} from "ngx-mask";
import {NgIf} from "@angular/common";
import {PaymentQrModalComponent} from "../payment-qr-modal/payment-qr-modal";
import {animate, style, transition, trigger} from "@angular/animations";
import {EspSignConfirmComponent} from "../../../core/components/esp-sign-confirm/esp-sign-confirm.component";
import {TranslateModule} from "@ngx-translate/core";

@Component({
  selector: 'app-payment-sign-modal',
  imports: [NgxMaskPipe, NgIf, TranslateModule],
  templateUrl: './payment-sign-modal.html',
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

export class PaymentSignModalComponent implements OnInit {
  safePdfUrl!: SafeResourceUrl;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<PaymentSignModalComponent>,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog,
    public router: Router,
  ) {
    this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.data);
  }

  ngOnInit() {
    console.log(this.data, "data")
  }

  qrDialog() {
    this.dialog.open(PaymentQrModalComponent, {
      data: this.data,
      disableClose: true,
    });
    this.close();
  }

  espDialog() {
    this.dialog.open(EspSignConfirmComponent, {
      width: '560px',
      data: this.data,
    }).afterClosed()
      .subscribe({
        next: () => {
          this.close();
        }
      });
    this.close();
  }

  close() {
    this.dialogRef.close();
  }

  protected readonly Math = Math;
}
