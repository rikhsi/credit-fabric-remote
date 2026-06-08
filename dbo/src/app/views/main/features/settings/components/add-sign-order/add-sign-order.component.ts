import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  inject, OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {MatIcon} from "@angular/material/icon";
import {NgxMaskDirective} from "ngx-mask";
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {UiSvgIconComponent} from "../../../../../../core/components/ui-svg-icon/ui-svg-icon.components";
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDragPlaceholder,
  CdkDropList,
  moveItemInArray
} from '@angular/cdk/drag-drop';
import {MatOption} from "@angular/material/autocomplete";
import { MatFormField, MatLabel, MatSelect, MatSuffix } from '@angular/material/select';
import {MatChip} from "@angular/material/chips";
import { NgClass, NgForOf, NgIf } from '@angular/common';
import {MatInput} from "@angular/material/input";
import {SettingsService} from "../../services/settings.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {ToastrService} from "ngx-toastr";
import {UtilsService} from "../../../../../../core/services/utils.service";
import { DialogRef } from '@angular/cdk/dialog';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
    selector: 'app-add-sign-order',
    imports: [
        MatIcon,
        NgxMaskDirective,
        ReactiveFormsModule,
        UiSvgIconComponent,
        MatOption,
        MatSelect,
        MatLabel,
        MatFormField,
        MatChip,
        NgForOf,
        CdkDropList,
        CdkDrag,
        MatInput,
        CdkDragHandle,
        NgClass,
        MatSuffix,
        MatIconButton,
        MatTooltip,
        CdkDragPlaceholder,
        NgIf,
        MatButton
    ],
    templateUrl: './add-sign-order.component.html',
    styleUrls: ['./add-sign-order.component.scss'],
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
export class AddSignOrderComponent implements OnInit {
  @Output() add = new EventEmitter<void>();

  modes: string[] = ['TRANSACTION', 'SWIFT', 'BUDGET', 'SALARY', 'CARD', 'PAYNET', 'DEPOSIT_WITHDRAW', 'LOAN_REPAYMENT', 'LOAN_PRETERM', 'ACCREDIT'];
  roles: string[] = ['DIRECTOR','HEAD_OF_FINANCE','FINANCE_MANAGER'];
  actions = ['CREATE', 'APPROVE', 'SIGN', 'SEND'];

  signOrderForm: FormGroup = new FormGroup({
    name: new FormControl("", Validators.required),
    code: new FormControl("1000", Validators.required),
    mode: new FormControl("TRANSACTION", Validators.required),
    order: new FormArray([
      new FormGroup({
        roleType: new FormControl('', Validators.required),
        action: new FormControl('', Validators.required),
      }),
    ]),
  });

  constructor(
    private destroyRef: DestroyRef,
    protected dialogRef: MatDialogRef<AddSignOrderComponent>,
    private utilsService: UtilsService,
    private toastrService: ToastrService,
    private settingsService: SettingsService,
    private _cdRef: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
  }

  get orderFormArray(): FormArray {
    return this.signOrderForm.get('order') as FormArray;
  }

  addOrder(): void {
    this.orderFormArray.push(
      new FormGroup({
        roleType: new FormControl('', Validators.required),
        action: new FormControl('', Validators.required),
      })
    );
  }

  removeOrder(index: number): void {
    this.orderFormArray.removeAt(index);
  }

  drop(event: CdkDragDrop<FormControl[]>): void {
    moveItemInArray(this.orderFormArray.controls, event.previousIndex, event.currentIndex);
  }

  onSubmit() {
    const data = this.signOrderForm.getRawValue();
    const rolesMap = this.convertRolesArrayToMap(data.order);

    if (this.signOrderForm.valid) {
      const payload = {
        ...data,
        order: rolesMap,
      }
      this.utilsService.spinnerState$$.next(true)
      this.settingsService.addSignOrder(payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (res) => {
            if (!res) return;
            this.toastrService.success(res.msg);
            this.add.emit();
            this.dialogRef.close();
          },
          error: (err: any) => {
            const message = err.message || err || 'Ошибка!';
            this.toastrService.error(message);
            this.utilsService.spinnerState$$.next(false);
          }
        });

    }
  }

  convertRolesArrayToMap(rolesArray: any[]) {
    return rolesArray.reduce((acc, item, index) => {
      acc[index + 1] = item;
      return acc;
    }, {} as Record<number, { roleType: string; action: string }>);
  }
}
