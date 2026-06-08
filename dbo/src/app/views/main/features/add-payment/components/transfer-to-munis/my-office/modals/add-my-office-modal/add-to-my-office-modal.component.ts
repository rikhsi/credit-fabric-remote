import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Inject,
  Input,
  OnInit, output,
  Output,
  signal
} from '@angular/core';
import {animate, style, transition, trigger} from "@angular/animations";
import {NgClass, NgIf} from "@angular/common";
import {TranslateModule} from "@ngx-translate/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MunisListItem} from "../../../../../../accounts-payments/models/accounts-payments.model";
import {PaymentService} from "../../../../../../../../../core/services/payment.service";
import {ToastrService} from "ngx-toastr";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Router} from "@angular/router";
import {TransactionOneDetailDto} from "../../../../../../../../../core/models/transaction.models";
import {UtilsService} from "../../../../../../../../../core/services/utils.service";
import {CreateTitleModalComponent} from "../create-title-modal/create-title-modal.component";

@Component({
  selector: 'app-add-to-my-office-modal',
  imports: [
    NgIf,
    TranslateModule,
    NgClass,
    FormsModule,
    ReactiveFormsModule,
    CreateTitleModalComponent
  ],
  templateUrl: './add-to-my-office-modal.component.html',
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
    ]),
    trigger('dropdownAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scaleY(0)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scaleY(1)' })),
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scaleY(0)' })),
      ]),
    ]),
  ],
})
export class AddToMyOfficeModalComponent implements OnInit {
  public data: any = inject(MAT_DIALOG_DATA)
  public readonly onClose = output<string>()

  paymentService = inject(PaymentService)
  toast = inject(ToastrService)
  router = inject(Router)
  utilService = inject(UtilsService)
  dialogRef =inject(MatDialogRef<AddToMyOfficeModalComponent>)

  selectedOffice = signal('');
  selectedName = signal('');
  officeName = signal('');
  openOffice = signal(false);
  createOffice = signal(false);
  myOffice = signal<MunisListItem[] | null>([]);

  ngOnInit() {
    console.log(this.data, "data")
    this.getMyOffice();
  }

  closeCreateOffice() {
    this.createOffice.set(false);
  }

  onCancel() {
    this.dialogRef.close();
  }

  // onAgree() {
  //   this.agree.emit(this.selectedOffice());
  // }


  createNewOffice() {
    this.paymentService.createOfficeName({name: this.officeName()}).pipe().subscribe({
      next: (res: any) => {
        if (res) {
          this.addServiceToMyOffice(res.id)
        } else {
          this.toast.error(res?.message);
        }
      },
      error: error => {
        this.toast.error(error.message);
      }
    })
  }

  addServiceToMyOffice(id?: string) {
    this.utilService.spinnerState$$.next(true);
    this.paymentService.addServiceToOffice({
      officeUuid: id ?? this.selectedOffice(),
      transactionUuid: this.data.transactionId
    }).pipe().subscribe({
      next: () => {
        this.utilService.spinnerState$$.next(false);
        this.router.navigate([`payment/transfer-to-munis/my-office`], {
          queryParams: {
            id: id ?? this.selectedOffice(),
          }
        });
        this.dialogRef.close('close')
      },
      error: err => {
        this.utilService.spinnerState$$.next(false);
        this.toast.error(err.message)
      }
    })
  }

  getMyOffice() {
    this.paymentService.getMyOffice().pipe().subscribe({
      next: data => {
        this.myOffice.set(data);
      },
      error: error => {
        this.toast.error(error.message);
      }
    })
  }

  protected readonly Math = Math;
}
