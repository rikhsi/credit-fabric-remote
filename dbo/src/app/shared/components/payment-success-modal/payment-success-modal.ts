import {ChangeDetectionStrategy, Component, Inject, OnInit, signal} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {ActivatedRoute, Router} from "@angular/router";
import {NgxMaskPipe} from "ngx-mask";
import {PaymentSignModalComponent} from "../payment-sign-modal/payment-sign-modal";
import {PaymentQrModalComponent} from "../payment-qr-modal/payment-qr-modal";
import {animate, style, transition, trigger} from "@angular/animations";
import {NgClass, NgIf, NgStyle} from "@angular/common";
import {TranslateModule} from "@ngx-translate/core";
import {PaymentService} from "../../../core/services/payment.service";
import {UserService} from "../../../core/services/user.service";
import {MatTooltip} from "@angular/material/tooltip";

@Component({
  selector: 'app-payment-success-modal',
  imports: [NgxMaskPipe, NgIf, TranslateModule, MatTooltip, NgClass,NgStyle],
  templateUrl: './payment-success-modal.html',
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

export class PaymentSuccessModalComponent implements OnInit {
  safePdfUrl!: SafeResourceUrl;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<PaymentSuccessModalComponent>,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog,
    public router: Router,
    public route: ActivatedRoute,
    public userService: UserService,
    public paymentService: PaymentService,
  ) {
    this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.data);
  }

  canSign = signal<boolean>(false)
  loading = signal<boolean>(false)
  docNumItem = signal<string>('')

  ngOnInit() {
    this.loading.set(true);
    this.paymentService.getTransactionOne(this.data.transactionId).pipe().subscribe({
      next: (data: any) => {
        this.canSign.set(data?.hasPermissionToSign);
        this.loading.set(false);
        this.docNumItem.set(data?.docNum || '')
      },
      error: () => {
        this.loading.set(true);
      }
    })
  }

  signDialog() {
    this.dialog.open(PaymentSignModalComponent, {
      data: {
        action: {
          externalId: this.data.transactionId,
          action: 'SIGN_AND_SEND',
          type: this.data.transactionMode,
          successMessage: 'Успешно!',
          from: 'sign-payment'
        },
        transactionId: this.data.transactionId,
        transaction: {...this.data, docNumItem:this.docNumItem(),}
      },
      disableClose: true,
    });
  }

  redirectAction() {
    const url = this.route.snapshot.queryParamMap.get('returnUrl')
    if (url != null) {
       this.router.navigateByUrl(url)
    } else {
      this.router.navigate(["/"])
    }

  }

  close() {
    this.dialogRef.close();
  }

  protected readonly Math = Math;
}
