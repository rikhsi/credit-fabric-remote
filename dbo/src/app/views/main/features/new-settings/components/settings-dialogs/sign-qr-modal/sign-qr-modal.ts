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
import {Router} from "@angular/router";
import {NgIf} from "@angular/common";
import { QRCodeComponent } from 'angularx-qrcode';
import {animate, style, transition, trigger} from "@angular/animations";
import {take} from "rxjs";
import {NewSettingsService} from "../../../services/new-settings.service";
import {ToastrService} from "ngx-toastr";
import {UtilsService} from "../../../../../../../core/services/utils.service";
import {TransactionService} from "../../../../../../../core/services/transaction.service";
import {PaymentService} from "../../../../../../../core/services/payment.service";
import {PaymentSignModalComponent} from "../../../../../../../shared/components/payment-sign-modal/payment-sign-modal";
import {SuccessModalComponent} from "../../../../../../../shared/components/success-modal/success-modal";
import {SigningDialogComponent} from "../signing-dialog/signing-dialog.component";
import {SettingsSuccessModal} from "../settings-success-modal/settings-success-modal";
import {TranslateModule} from "@ngx-translate/core";

@Component({
  selector: 'app-sign-qr-modal',
  imports: [
    QRCodeComponent,
    TranslateModule
  ],
  templateUrl: './sign-qr-modal.html',
  styleUrls: ['./sign-qr-modal.scss'],
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

export class SignQrModalComponent implements OnInit, OnDestroy {
  @Output() onDetail = new EventEmitter<string>();
  safePdfUrl!: SafeResourceUrl;
  qrLink: string = '';
  timer = 59;
  intervalId!: NodeJS.Timer;
  intervalRef: any;
  checkId = signal<string>('')
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<SignQrModalComponent>,
    private sanitizer: DomSanitizer,
    private utilsService: UtilsService,
    private transactionService: TransactionService,
    private cf: ChangeDetectorRef,
    private paymentService: PaymentService,
    private dialog: MatDialog,
    public router: Router,
    private newSettingsService: NewSettingsService,
    private toastService: ToastrService,
  ) {
  }

  ngOnInit() {

    this.intervalRef = setInterval(() => {
      this.check(false)
    }, 4000)
    this.getQrCode();
    this.startCounter();
  }

  ngOnDestroy() {
    clearInterval(this.intervalRef);
  }

  startCounter(): void {
    if (this.timer === 0) {
      this.stopCounter();
      return;
    }
    this.intervalId = setInterval(() => {
      if (this.timer === 0) {
        this.stopCounter();
        this.close();
      } else {
        this.timer--
      }

      this.cf.detectChanges();
    }, 1000);
  }
  stopCounter(): void {
    this.intervalId && clearInterval(this.intervalId as any);
  }

  getQrCode() {
    // this.transactionService.getQrForPayment(this.data.transactionId).pipe()
    //   .subscribe((res: any) => {
    //     this.qrLink = res.qrLink
    //     this.cf.detectChanges();
    //   })

    const processStatus =   this.data?.actionType === 'ChangeRole'  ? 'BUSINESS_USER_CHANGE_ROLE' : this.data?.actionType === 'Create' ? "BUSINESS_USER_CREATE" : this.data?.actionType === 'Delete' ? "BUSINESS_USER_DELETE" :  this.data?.actionType === 'SignOrder' ?'SIGN_ORDER_CHANGE' : ""
    if (!this.data?.body) return;
    console.log("111111", this.data);
     const body = this.toBase64(this.data.body)
    if (!processStatus) return
    this.newSettingsService.signUserProcess({action: processStatus, payload: body})
      .pipe(take(1))
      .subscribe({
        next: (res: any) => {
          console.log(333333, res)
          if (res.success) {
            // this.successUserCreate()
            this.qrLink = res?.result?.data?.link
            this.checkId.set(res?.result?.data?.id || '')
            this.cf.detectChanges();
          } else {
            const mg = res.result?.message || '';
            this.toastService.error(mg || "Произошла ошибка.");
          }
        },
        error: (err) => {
          const mg = err.result?.message || '';
          this.toastService.error(mg || "Произошла ошибка.");

        }
      });


  }

  openOtherSignModal() {
    this.close();
     this.dialog.open(SigningDialogComponent, {
        data: this.data,
        disableClose: true,
      });

  }

  check(loading: boolean = true) {
    if (loading) {
      this.utilsService.spinnerState$$.next(true);
    }

    // this.paymentService.getTransactionOne({id: this.checkId()}).pipe()
    //   .subscribe((res: any) => {
    //     if (res.status === "IN_PROCESS") {
    //       this.onDetail.emit("sign");
    //       this.dialog.open(SuccessModalComponent, {
    //         data: this.data,
    //         disableClose: true,
    //       })
    //       this.close();
    //       this.utilsService.spinnerState$$.next(false);
    //     }
    //   })
    if (this.checkId()) {
      this.newSettingsService.signUserProcessCheck({id: this.checkId()})
        .pipe(take(1))
        .subscribe({
          next: (res: any) => {
            if (res.success) {
              // this.successUserCreate()
              console.log(33111, res)
             if (res?.result?.data?.status === 'SUCCESS') {
               this.openSuccessModal()
               this.newSettingsService.triggerRefresh()
               this.newSettingsService.clearUserCreateDraft();

             } else if (res?.result?.data?.status === 'ERROR' || res?.result?.data?.status === 'EXPIRED') {
               this.dialog.closeAll()
               const mg = res.result?.message || '';
               this.toastService.error(mg || "Произошла ошибка.");
               this.stopCounter()
             }
            } else {
              const mg = res.result?.message || '';
              this.toastService.error(mg || "Произошла ошибка.");
              this.dialog.closeAll()
              this.stopCounter()
            }
          },
          error: (err) => {
            const mg = err.result?.message || '';
            this.toastService.error(mg || "Произошла ошибка.");
            this.dialog.closeAll()
            this.stopCounter()

          }
        });
    }
  }
  openSuccessModal(){
    this.dialog.closeAll();
    this.dialog.open(SettingsSuccessModal, {
      data: {windowType: 'USER', type: 'user-process', actionType: this.data?.actionType },
      disableClose: true,
    });
  }
  close() {
    this.dialog.closeAll();
    this.stopCounter()
  }

  toBase64(obj: any): string {
    const json = JSON.stringify(obj);
    return btoa(
      new TextEncoder().encode(json)
        .reduce((acc, byte) => acc + String.fromCharCode(byte), '')
    );
  }

  protected readonly Math = Math;
}
