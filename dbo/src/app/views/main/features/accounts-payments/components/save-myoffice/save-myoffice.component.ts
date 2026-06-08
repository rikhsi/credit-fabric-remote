import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  Inject,
  OnInit,
  Output,
  signal
} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgClass, NgIf} from "@angular/common";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {UtilsService} from "../../../../../../core/services/utils.service";
import {AccountsPaymentsService} from "../../services/accounts-payments.service";
import {ToastrService} from "ngx-toastr";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {TranslateModule} from "@ngx-translate/core";
import {PaymentService} from "../../../../../../core/services/payment.service";
import {MunisListItem} from "../../models/accounts-payments.model";
import {animate, style, transition, trigger} from "@angular/animations";
import {MatMenu, MatMenuTrigger} from "@angular/material/menu";

@Component({
  selector: 'app-save-myoffice',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    NgIf,
    TranslateModule,
    MatMenu,
    MatMenuTrigger
  ],
  templateUrl: './save-myoffice.component.html',
  styles: [`
  .mat-mdc-menu-panel {
    width: 400px !important;
    max-width: 400px !important;
  }
`],
  animations: [
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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaveMyOfficeComponent implements OnInit {
  templateForm:FormGroup = new FormGroup({
    transactionId:new FormControl('',Validators.required),
    officeId:new FormControl('',Validators.required),
    officeName :new FormControl(''),
  })

  officeList = signal<MunisListItem[] | null>([]);
  openSelect = signal(false);

  constructor(
    public dialog:MatDialogRef<SaveMyOfficeComponent>,
    @Inject(MAT_DIALOG_DATA) public data:string,
    private _utilsService:UtilsService,
    private toast:ToastrService,
    private destroyRef: DestroyRef,
    private paymentService: PaymentService,
  ) {

    if (this.data){
      this.templateForm.patchValue({
        transactionId:this.data
      })
    }
  }

  ngOnInit() {
    this.paymentService.getMyOffice().pipe().subscribe({
      next: data => {
        this.officeList.set(data)
      },
      error: error => {

      }
    })
  }

  @Output() save = new EventEmitter<void>()

  formSubmit(){
    if (this.templateForm.valid){
      this._utilsService.spinnerState$$.next(true);
      this.paymentService.addServiceToOffice({
        officeUuid: this.templateForm.getRawValue().officeId,
        transactionUuid: this.templateForm.getRawValue().transactionId,
      })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (res)=>{
            if (!res) return
            this.toast.success(res.msg);
            this.save.emit();
          },
          error: (err) => {
            this.toast.error(err.message);
            this._utilsService.spinnerState$$.next(false);
          },
          complete: () => {
            this._utilsService.spinnerState$$.next(false);
            this.dialog.close('update');
          }
        })
    }
  }
}
