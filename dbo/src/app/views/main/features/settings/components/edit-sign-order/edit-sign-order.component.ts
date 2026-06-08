import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Output, ViewEncapsulation
} from '@angular/core';
import {SignOrderResponse} from "../../models/settings.model";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {SettingsService} from "../../services/settings.service";
import {ToastrService} from "ngx-toastr";
import {UtilsService} from "../../../../../../core/services/utils.service";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray} from "@angular/cdk/drag-drop";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {MatChip} from "@angular/material/chips";
import {MatFormField} from "@angular/material/form-field";
import {MatIcon} from "@angular/material/icon";
import {MatLabel, MatSelect} from "@angular/material/select";
import {NgClass, NgForOf} from "@angular/common";
import {UiSvgIconComponent} from "../../../../../../core/components/ui-svg-icon/ui-svg-icon.components";
import {MatOption} from "@angular/material/core";

@Component({
    selector: 'app-edit-sign-order',
    imports: [
        CdkDrag,
        CdkDragHandle,
        CdkDropList,
        MatChip,
        MatFormField,
        MatIcon,
        MatOption,
        MatLabel,
        MatSelect,
        NgForOf,
        ReactiveFormsModule,
        UiSvgIconComponent,
        NgClass,
    ],
    templateUrl: './edit-sign-order.component.html',
    styles: `
    select {
      -webkit-appearance: none;
      appearance: none;
    }

    .payment-select {
      .mdc-notched-outline__leading,
      .mdc-notched-outline__notch,
      .mdc-notched-outline__trailing {
        border-color: #dbdbdb !important;
      }

      .mdc-text-field--outlined {
        --mdc-outlined-text-field-container-shape: 10px !important;
      }

      .mat-mdc-select-arrow {
        display: none;
      }

      .mat-mdc-form-field-flex {
        height: 44px;
        padding: 8px;
      }

      .mat-mdc-form-field-infix {
        padding-top: 16px;
        top: -15px;
      }

      .mat-mdc-select-placeholder,
      .mat-mdc-form-field-input-control,
      .mat-mdc-select-value-text {
        color: #000;
      }

      .mat-mdc-text-field-wrapper {
        padding: 0;
      }
    }
  `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class EditSignOrderComponent implements AfterViewInit{
  @Output() edit = new EventEmitter<void>();
  public data:SignOrderResponse = inject(MAT_DIALOG_DATA)
  #destroy = inject(DestroyRef)
  public _dialogRef = inject(MatDialogRef<EditSignOrderComponent>)
  private _settingsService = inject(SettingsService)
  private _toast = inject(ToastrService)
  private _utilsService = inject(UtilsService)
  editSignOrderForm: FormGroup = new FormGroup({
    name: new FormControl("", Validators.required),
    code: new FormControl("", Validators.required),
    mode: new FormControl("", Validators.required),
    roles: new FormControl([[]], Validators.required),
  })
  modes: string[] = ['TRANSACTION', 'SWIFT', 'BUDGET', 'SALARY', 'CARD', 'PAYNET', 'DEPOSIT_WITHDRAW', 'LOAN_REPAYMENT', 'LOAN_PRETERM', 'ACCREDIT'];
  roles: string[] = ['DIRECTOR', 'HEAD_OF_FINANCE', 'FINANCE_MANAGER'];
  selectedRoles: string[] = [];

  onRolesChange(event: any) {
    this.selectedRoles = event.value; // Update selectedRoles based on the user's selection
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.selectedRoles, event.previousIndex, event.currentIndex);
  }
  loadData() {
    // Fetch the data for the given ID
      this.editSignOrderForm.patchValue({
        name: this.data.name,
        code: this.data.code,
        mode: this.data.mode,
        roles: this.data.order ? Object.values(this.data.order) : []
      });

      this.selectedRoles = this.data.order ? Object.values(this.data.order) : [];

  }

  onSubmit() {
    if (this.editSignOrderForm.valid) {
      const formValue = this.editSignOrderForm.value;
      const orderedRoles = this.selectedRoles.reduce((acc, role, index) => {
        // @ts-ignore
        acc[index + 1] = role;
        return acc;
      }, {});

      const payload = {
        name: formValue.name,
        code: formValue.code,
        mode: formValue.mode,
        order: orderedRoles
      };
      this._utilsService.spinnerState$$.next(true)
      this._settingsService.editSignOrder(this.data.id,payload).pipe(takeUntilDestroyed(this.#destroy)).subscribe((res) => {
        if (!res) return
        this._toast.success(res.msg)
        this.edit.emit()
      })

    }
  }

  ngAfterViewInit(): void {
    setTimeout(()=>{
      this.loadData()
    },0)
  }
}
