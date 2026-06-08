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
  selector: 'app-user-create-dialog',
  standalone: true,
  templateUrl: './user-create-dialog.component.html',
  styleUrls: ['./user-create-dialog.component.scss'],
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
export class UserCreateDialogComponent implements OnInit {
  @ViewChild('roleSelect') roleSelect!: MatSelect;
  @ViewChild('phoneInput') phoneInput!: ElementRef<HTMLInputElement>;
  @Output() onDetail = new EventEmitter<string>();

  form!: FormGroup;
  fields = {
    username: { key: 'username', label: this.translateService.instant('authorization.phone_number'), type: 'text',  hint: '91 123 45 67', maxlength: 12},
    firstName: { key: 'firstName', label: this.translateService.instant('new.name'), type: 'text' },
    lastName: { key: 'lastName', label: this.translateService.instant('new.surname'), type: 'text' },
    middleName: { key: 'middleName',  label: `${this.translateService.instant('new.surname_1')} (необязательно)`, type: 'text' },
    pinfl: { key: 'pinfl', label: this.translateService.instant('createPayment.pinfl'), type: 'text', hint: '01234567890123', maxlength: 14 },
    passportInfo: { key: 'passportInfo', label: this.translateService.instant('settings.passport_data'), type: 'text', hint: 'AA1223456' },
    email: { key: 'email', label: this.translateService.instant('settings.email_alt'), type: 'email' },
    roleId: { key: 'roleId', label: this.translateService.instant('settings.user_role'),type: 'select' },
  };

  roles: RoleDto[] = [];
  permissions = signal<any>([]);
  permissionsEditList = signal<any>([]);
  isLoading = signal<boolean>(false)
  editRoleStatus = signal<boolean>(false)
  editPermissionStatus = signal<boolean>(false)
  constructor(
    private dialog: MatDialog,
    private fb: FormBuilder,
    public newSettingsService: NewSettingsService,
    private toastrService: ToastrService,
    private matSmsDialoggRef: MatDialogRef<UserCreateDialogComponent>,
    private translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: {
    roles: RoleDto[],
  },
  ) {
    this.roles = this.data.roles ? this.data.roles : [];
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      username: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{9}$/),
        ],
      ],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      middleName: [''],
      pinfl: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{14}$/),
        ],
      ],
      // passportInfo: ['', [Validators.required, Validators.pattern(/^[A-Z]{2}\d{7}$/)]],
      passportInfo: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/)]],
      roleId: ['', Validators.required],
    });

    // const draft = this.newSettingsService.userCreateDraft();
    // if (draft?.username?.startsWith('998')) {
    //   draft.username = draft.username.slice(3);
    // }

    // if (draft) {
    //   this.form.patchValue(draft);

    //   if (draft.permissions) {
    //     this.permissions.set(draft.permissions);
    //   }
    // }

    // setTimeout(() => this.phoneInput.nativeElement.focus(), 200);


  const draft = this.newSettingsService.userCreateDraft();

  if (draft) {
    let username = draft.username || '';
    if (username.startsWith('998')) {
      username = username.slice(3);
    }

    this.form.patchValue({
      ...draft,
      username: username
    });

    if (draft.permissions?.length) {
      this.permissions.set(draft.permissions);
    }

    if (draft.roleId) {
      this.form.get('roleId')?.setValue(draft.roleId);
    }
  }

  setTimeout(() => this.phoneInput.nativeElement.focus(), 200);

  }



  blockNumbers(event: KeyboardEvent) {
    if (/\d/.test(event.key)) {
      event.preventDefault();
    }
  }

  allowOnlyNumbers(event: KeyboardEvent, type): void {
    if (type.key === 'username') {
      const charCode = event.key.charCodeAt(0);
      if (charCode < 48 || charCode > 57) {
        event.preventDefault();
      }
    } else if (type?.key === 'pinfl') {
      const charCode = event.key.charCodeAt(0);
      if (charCode < 48 || charCode > 57) {
        event.preventDefault();
      }
    } else if (type?.key === 'passportInfo') {
      // const input = event.target as HTMLInputElement;
      // const currentValue = input.value || '';
      // const cursorPos = input.selectionStart ?? currentValue.length;
      //
      // if (cursorPos < 2) {
      //   if (!/^[a-zA-Z]$/.test(event.key) && !event.ctrlKey && !event.metaKey && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(event.key)) {
      //     event.preventDefault();
      //   }
      // } else if (cursorPos < 9) {
      //   if (!/^\d$/.test(event.key) && !event.ctrlKey && !event.metaKey && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(event.key)) {
      //     event.preventDefault();
      //   }
      // } else if (cursorPos >= 9 && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(event.key)) {
      //   event.preventDefault();
      // }
    }
  }

  onFieldInput(event: Event, fieldKey: string): void {
    const input = event.target as HTMLInputElement;
    const ctrl = this.form.get(fieldKey);

    if (fieldKey === 'pinfl') {
      const digitsOnly = input.value.replace(/\D/g, '').slice(0, 14);
      input.value = digitsOnly;
      ctrl?.setValue(digitsOnly, { emitEvent: false });
    } else if (fieldKey === 'passportInfo') {
      // let val = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      // const letters = val.replace(/\d/g, '').slice(0, 2);
      // const digits = val.replace(/\D/g, '').slice(0, 7);
      // val = letters + digits;
      // input.value = val;
      // ctrl?.setValue(val, { emitEvent: false });
    }
    else if (fieldKey === 'email') {
      let value = input.value.replace(/[^A-Za-z0-9@._%+-]/g, '');
      value = value.toLowerCase();

      input.value = value;
      ctrl?.setValue(value, { emitEvent: false });
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    } else {

      const formData = {
        ...this.form.value,
        username: `998${this.form.value.username}`,
        permissions: this.permissions()
      };

      this.newSettingsService.setUserCreateDraft(formData);

      this.openSigningDialog()
        // this.newSettingsService.createUserAccount({...this.form.value, username: `998${this.form.value.username}`, permissions: this.permissions()  })
        //   .pipe(take(1))
        //   .subscribe({
        //     next: (res: any) => {
        //       if (res.success) {
        //         this.successUserCreate()
        //       } else {
        //         const mg = res.result?.message || '';
        //         this.toastrService.error(mg || "Произошла ошибка.");
        //       }
        //     },
        //     error: (err) => {
        //       const mg = err.result?.message || '';
        //       this.toastrService.error(mg || "Произошла ошибка.");
        //
        //     }
        //   });


      }

  }
  openSigningDialog(): void {
    this.dialog.closeAll()
    this.dialog.open(SigningDialogComponent, {
      data: { type: "physical_virtual_eds_and_qr", actionType: "Create" , body: {...this.form.value, username: `998${this.form.value.username}`, permissions: this.permissions()  }},
      width: '540px',
    })
  }
  focusSelect() {
    this.roleSelect.open();
  }
  successUserCreate(){
    this.matSmsDialoggRef.close();
    this.newSettingsService.triggerRefresh()
    const msg = this.translateService.instant(`settings.success`) || ''
    this.toastrService.success(msg.toString());
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
  permissionChangen(){
    this.permissionsEditList.set( this.permissions()?.length ? JSON.parse(JSON.stringify(this.permissions())) : []);
    this.editPermissionStatus.set(true)
  }
  selectRole(){
    this.editRoleStatus.set(true)
  }
  selectRoleId(role) {
    if (!role?.id) return
    this.form.get('roleId')?.setValue(role.id);
  }
  canceledRole(){
    this.form.get('roleId')?.setValue("");
    this.editRoleStatus.set(false)
    this.permissions.set([])
  }
  getRoleName(id: string) {
    if (this.roles?.length) {
      const item = this.roles?.find((item) => item.id === id);
      return item?.displayName || ''
    }
    return ""
  }
  attachRole(){
   const id = this.form.get('roleId')?.value
    if (id) {
      this.editRoleStatus.set(false)
      this.onRoleChanged(id)
    }
  }
  onPermissionChange(item: any, type: string, checked: any) {
    item.types[type] = checked?.target?.checked || false;
    if (type === 'READ' && !checked?.target?.checked) {

      if (item.types['SIGN'] !== undefined) {
        item.types['SIGN'] =  false
      }
      if (item.types['ACTION'] !== undefined) {
        item.types['ACTION'] =  false
      }

    } else if (type !=='READ' && checked?.target?.checked) {

      if (item.types['READ'] !== undefined) {
        item.types['READ'] =  true
      }

    }
  }

 applyPermissions(){
    this.permissions.set( this.permissionsEditList()?.length ? JSON.parse(JSON.stringify(this.permissionsEditList())) : [])
    this.editPermissionStatus.set(false)
 }
 
 clear() {
  this.form.reset();
  this.clearPermissions();
  sessionStorage.removeItem('userCreateDraft');
  this.canceledRole()
 }


 clearPermissions(){
    this.permissionsEditList.set([])
    this.editPermissionStatus.set(false)
 }
  closeUserCreateDialog(){
    // this.newSettingsService?.clearUserCreateDraft()
     const formData = {
    ...this.form.value,
    username: this.form.value.username 
      ? `998${this.form.value.username}` 
      : '',
    permissions: this.permissions()
  };
  this.newSettingsService.setUserCreateDraft(formData);
  }
  protected readonly getTransactionTypeTranslation = getTransactionTypeTranslation;
}
