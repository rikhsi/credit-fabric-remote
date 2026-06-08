import {Component, ElementRef, EventEmitter, Inject, OnInit, Output, signal, ViewChild} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogClose, MatDialogRef} from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {RoleDto} from "../../../models/settings.model";
import {take} from "rxjs";
import {NewSettingsService} from "../../../services/new-settings.service";
import {ToastrService} from "ngx-toastr";
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {MatCheckbox} from "@angular/material/checkbox";
import {MatMenu} from "@angular/material/menu";
import {UiSvgIconComponent} from "../../../../../../../core/components/ui-svg-icon/ui-svg-icon.components";
import {getTransactionTypeTranslation} from "../../../../../../../core/models/transaction.models";
import {
  EspSignConfirmComponent
} from "../../../../../../../core/components/esp-sign-confirm/esp-sign-confirm.component";
import {SigningDialogComponent} from "../signing-dialog/signing-dialog.component";

@Component({
  selector: 'app-user-sign-order-dialog',
  standalone: true,
  templateUrl: './user-sign-order-dialog.component.html',
  styleUrls: ['./user-sign-order-dialog.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogClose,
    MatDivider,
    MatSelect,
    MatIcon,
    NgxMaskDirective,
    TranslateModule,
  ],
  providers: [
    provideNgxMask()
  ],
})
export class UserSignOrderDialogComponent implements OnInit {
  @ViewChild('roleSelect') roleSelect!: MatSelect;
  @ViewChild('phoneInput') phoneInput!: ElementRef<HTMLInputElement>;
  @Output() onDetail = new EventEmitter<string>();

  form!: FormGroup;
  fields = {
    username: { key: 'username', label: this.translateService.instant('authorization.phone_number'), type: 'text',  hint: '91 123 45 67', maxlength: 12},
    firstName: { key: 'firstName', label: this.translateService.instant('global.name'), type: 'text' },
    lastName: { key: 'lastName', label: 'Фамилия', type: 'text' },
    middleName: { key: 'middleName', label: 'Отчество (необязательно)', type: 'text' },
    pinfl: { key: 'pinfl', label: this.translateService.instant('createPayment.pinfl'), type: 'text', hint: '14 цифр', maxlength: 14 },
    passportInfo: { key: 'passportInfo', label: this.translateService.instant('settings.passport_data'), type: 'text', hint: 'AA1234567', maxlength: 9 },
    email: { key: 'email', label: this.translateService.instant('settings.email_alt'), type: 'email' },
    roleId: { key: 'roleId', label: this.translateService.instant('settings.user_role'),type: 'select' },
  };

  roles = signal<any[]>([]);
  permissions = signal<any>([]);
  permissionsEditList = signal<any>([]);
  isLoading = signal<boolean>(false)
  editRoleStatus = signal<boolean>(false)
  editPermissionStatus = signal<boolean>(false)
  selectId =signal<string>("")
  constructor(
    private dialog: MatDialog,
    private fb: FormBuilder,
    private newSettingsService: NewSettingsService,
    private toastrService: ToastrService,
    private matSmsDialoggRef: MatDialogRef<UserSignOrderDialogComponent>,
    private translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: {
    roles: any[],
  },
  ) {
  }

  ngOnInit(): void {
    this.loadRouters()
  }
  loadRouters() {
    this.newSettingsService.getRouterList().pipe(take(1))
      .subscribe({
        next: (res) => {
          console.log(5556, res)
          if (res?.success) {
            this.roles.set(res?.result?.data || null);
            const usedItem = this.roles().find((i) => i.isUsed);
            this.selectId.set( usedItem ? usedItem.uuid : '')
          } else {
            // this.errorMessage.set(res?.result?.message || '');
          }
        },
        error: (err: any) => {
          this.toastrService.error(err || err.message || 'Что то понло не так...');
        }
      });

    // .subscribe(res => {
    //   this.routerInfoItems.set(res || null);
    //   const usedItem = this.routerInfoItems().find((i) => i.isUsed);
    //   this.selectedRouterId = usedItem ? usedItem.uuid : null;
    // });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    } else {

      this.openSigningDialog()

    }

  }
  openSigningDialog(): void {
    this.dialog.closeAll()
    this.dialog.open(SigningDialogComponent, {
      data: { type: "physical_virtual_eds_and_qr", actionType: "SignOrder" , body: {signId: this.selectId()}},
      width: '540px',
    })
  }

  onRoleChanged(id) {
    // console.log('To‘liq obyekt:', event.source.selected);
    if (id) {
      this.loadPermissionList(id)
    }
  }
  loadPermissionList(id) {
    this.isLoading.set(true)
    this.newSettingsService.getUserPermission({id})
      .pipe(take(1))
      .subscribe({
        next: res => {
          console.log(4444, res)
          if (res?.success) {
            this.permissions.set( res?.result?.data || []);
            this.isLoading.set(false)
          } else {
            this.permissions.set([]);
            this.isLoading.set(false)
          }

        },
        error: (err: any) => {
          this.permissions.set([]);
          this.isLoading.set(false)
          console.log(555, err)
        }
      });
  }
  selectRoleId(role) {

    if (!role?.uuid) return
    this.selectId.set(role.uuid)
  }

  canceledRole(){
    this.dialog.closeAll()
  }
  attachRole(){

    this.openSigningDialog()
    //
    // if (this.selectId()) {
    //   this.newSettingsService.attachSignOrder({signId: this.selectId()})
    //           .pipe(take(1))
    //           .subscribe(res => {
    //             console.log(333, res)
    //             if (res?.msg) {
    //               this.toastrService.info(res.msg);
    //             }
    //           });
    // }


  }


  protected readonly getTransactionTypeTranslation = getTransactionTypeTranslation;
}
