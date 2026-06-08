import {ChangeDetectionStrategy, Component, Inject, OnInit, signal} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {ActivatedRoute, Router} from "@angular/router";
import {NgxMaskPipe} from "ngx-mask";
import {PaymentSignModalComponent} from "../payment-sign-modal/payment-sign-modal";
import {animate, style, transition, trigger} from "@angular/animations";
import {TranslateModule} from "@ngx-translate/core";
import {
  AddToMyOfficeModalComponent
} from "../../../views/main/features/add-payment/components/transfer-to-munis/my-office/modals/add-my-office-modal/add-to-my-office-modal.component";
import {NgClass, NgIf} from "@angular/common";

@Component({
  selector: 'app-success-munis-modal',
  imports: [NgxMaskPipe, TranslateModule, NgIf, NgClass],
  templateUrl: './success-munis-modal.component.html',
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

export class SuccessMunisModalComponent implements OnInit {
  safePdfUrl!: SafeResourceUrl;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<SuccessMunisModalComponent>,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog,
    public router: Router,
    public route: ActivatedRoute,
  ) {
    this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.data);
  }



  openAddToMyOfficeModal() {
    this.dialog.open(AddToMyOfficeModalComponent, {
      data: {
        transactionId: this.data.transactionId,
      },
      disableClose: true,
    }).afterClosed() .subscribe({
      next: res => {
        if (res === 'close') {
          this.close();
        }
      }
    });
  };



  openDetails() {
    this.data.onDetails?.()
  }
  ngOnInit() {
  }

  signDialog() {
    this.dialog.open(PaymentSignModalComponent, {
      data: {
        action: {
          externalId: this.data.transactionId,
          action: 'SIGN_AND_SEND',
          type: 'MUNIS',
          successMessage: 'Успешно!',
          from: 'sign-payment'
        },
        transactionId: this.data.transactionId,
        transaction: this.data.data
      },
      disableClose: true,
    });
    this.close();
  }
  closeDialog(){
    console.log("closeDialog", this.data?.data);
    if (this.data?.data?.transactionMode === 'KARTOTEKA') {
      this.dialog.closeAll()
    } else {
      this.router.navigate(['/']); this.close()
    }

  }
  close() {
    this.dialogRef.close();
  }

  protected readonly Math = Math;
}
