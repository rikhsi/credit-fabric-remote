import {Component, inject, Inject, OnInit, signal, TemplateRef} from "@angular/core";
import {Router} from "@angular/router";
import {MAT_DIALOG_DATA, MatDialog, MatDialogClose, MatDialogRef} from "@angular/material/dialog";
import {MatDivider} from "@angular/material/divider";

import {RoleDto, RoleInfo, SettingUserInfoDto} from "../../../models/settings.model";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatOption} from "@angular/material/autocomplete";
import { MatIcon } from '@angular/material/icon';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import {take} from "rxjs";
import {NewSettingsService} from "../../../services/new-settings.service";
import {ToastrService} from "ngx-toastr";
import {SmsCodeDialogComponent} from "../sms-code-dialog/sms-code-dialog.component";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {SigningDialogComponent} from "../signing-dialog/signing-dialog.component";
import {MatSnackBar} from "@angular/material/snack-bar";


@Component({
  selector: "app-signing-dialog",
  templateUrl: "./user-info-dialog.component.html",
  styleUrls: ["./user-info-dialog.component.scss"],
  imports: [
    MatIcon,
    MatDialogClose,
    MatDivider,
    NgIf,
    FormsModule,
    MatOption,
    MatSelect,
    NgForOf,
    ReactiveFormsModule,
    NgClass,
    TranslateModule,
  ]
})

export class UserInfoDialogComponent implements OnInit {
  private toastrService = inject(ToastrService)
  private readonly snackBar = inject(MatSnackBar)

  dialogRef!: MatDialogRef<any>;
  userInfo: SettingUserInfoDto;
  edit = false;
  roleId = '';
  roles: RoleDto[] = [];
  permissions = signal<any>([]);
  editRoleStatus = signal<boolean>(false)
  saveStatus = signal<boolean>(false)
  selectRoleInfo = signal<RoleInfo>({id: '', name: '', displayName: ''})
  editPermissionStatus = signal<boolean>(false)
  permissionsEditList = signal<any>([]);
  isLoading = signal<boolean>(false)

  constructor(
    public router: Router,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: SettingUserInfoDto,
    private newSettingsService: NewSettingsService,
    private matUserInfoDialoggRef: MatDialogRef<UserInfoDialogComponent>,
    private translateService: TranslateService

  ) {
    // this.userInfo = this.data;
    this.userInfo = JSON.parse(JSON.stringify(this.data))
    this.roles = this.data.roles ? this.data.roles : [];
  }

  ngOnInit() {
    this.selectRoleInfo.set({id: this.userInfo?.role?.id, name: this.userInfo?.role?.name, displayName: this.userInfo?.role?.displayName});
  }
  handleOtp(otp: any): void {
  }
  editRole(): void {
    this.edit = !this.edit;
  }
  attachRole(): void {
   // if (this.roleId) {
   //   this.newSettingsService.changeUserRole({userId: this.userInfo.uuid, roleId: this.roleId})
   //     .pipe(take(1))
   //     .subscribe(res => {
   //       if (res) {
   //         this.successUserCreate()
   //       } else {
   //         this.toastrService.error("Произошла ошибка.");
   //       }
   //     });
   // }
    const id = this.selectRoleInfo().id;
    if (id) {
      this.userInfo.role.id = this.selectRoleInfo().id
      this.userInfo.role.name = this.selectRoleInfo().name
      this.userInfo.role.displayName = this.selectRoleInfo().displayName
      this.editRoleStatus.set(false)
      this.onRoleChanged(id)
    }
    this.saveStatus.set(!this.arePermissionsEqual(this?.data?.permissions || [], this.userInfo?.permissions || []))

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
            // this.permissions.set( res?.result?.data || []);
            this.userInfo.permissions = res?.result?.data || []

            this.isLoading.set(false)
          } else {
            this.userInfo.permissions = []
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
  successUserCreate(){
    const msg = this.translateService.instant(`settings.success`) || ''
    this.toastrService.success(msg);
    this.dialog.closeAll();
    this.matUserInfoDialoggRef.close();
    this.newSettingsService.triggerRefresh()
  }
  changeStatusUser(value: string): void {
    if (!value) return
    if (this.userInfo?.uuid) {
      this.newSettingsService.changeUserStatus({uuid: this.userInfo.uuid, status: value})
        .pipe(take(1))
        .subscribe(res => {
          if (res) {
            this.successUserCreate()
              this.closeDialog()
          } else {
            this.toastrService.error("Произошла ошибка.");
          }
        });
    }
  }
  deleteUser(): void {
    if (this.userInfo?.uuid) {

      // this.newSettingsService.deleteUser({uuid: this.userInfo.uuid})
      //   .pipe(take(1))
      //   .subscribe(res => {
      //     if (res) {
      //       this.successUserCreate()
      //     } else {
      //       this.toastrService.error("Произошла ошибка.");
      //     }
      //   });

      this.openSigningDialog('Delete')

    }

  }
  openSigningDialog(name = ''): void {
    this.dialog.closeAll()
    console.log(344420000, this.userInfo)
    let bodyData = {}
    if (name === 'Delete') {
      bodyData = {uuid: this.userInfo.uuid }
    } else {
      bodyData = {userId: this.userInfo.uuid, roleId: this.userInfo.role.id, permissions: this.userInfo?.permissions ? [...this.userInfo?.permissions] : [] }
    }
    this.dialog.open(SigningDialogComponent, {
      data: { type: "physical_virtual_eds_and_qr", actionType: name? name : "ChangeRole" , body: bodyData },
      width: '540px',
    })
  }
  // openBlockDialog(template: TemplateRef<any>): void {
  //   this.matUserInfoDialoggRef.close();
  //   setTimeout(() => {
  //     this.dialogRef = this.dialog.open(template, {
  //       width: '359px',
  //     });
  //   }, 200)
  //
  // }

  openBlockDialog(template: TemplateRef<unknown>): void {
    this.dialog.closeAll()
    if (this.matUserInfoDialoggRef) {
      this.matUserInfoDialoggRef.close();
    }

    this.matUserInfoDialoggRef?.afterClosed()
      .pipe(take(1))
      .subscribe(() => {
        this.dialogRef = this.dialog.open(template, {
          width: '480px',
          disableClose: true,
          panelClass: 'settings-block-dialog'
        });
      });

    if (!this.matUserInfoDialoggRef) {
      this.dialogRef = this.dialog.open(template, {
        width: '480px',
        disableClose: true,
        panelClass: 'settings-block-dialog'
      });
    }
  }
  resendInvitation(userInfo: any): void {
    console.log(userInfo, 1212122)
    if (userInfo?.uuid && userInfo?.reinviteEnabled) {
      console.log(333333)
      this.newSettingsService.invitationResend({businessUserUuid: userInfo.uuid})
        .pipe(take(1))
        .subscribe({
          next: (res: any) => {
            if (res.success) {
              // this.successUserCreate()
              const title = this.translateService.instant('new_second.resend_invitation_info');
              const message = this.translateService.instant('new_second.resend_invitation_description');

              this.toastrService.success(
                message,title
              );
              this.closeDialog()
            } else {
              const mg = res.result?.message || '';
              this.toastrService.error(mg || "Произошла ошибка.");
            }
          },
          error: (err) => {
            const mg = err.result?.message || '';
            this.toastrService.error(mg || "Произошла ошибка.");

          }
        });
    }
  }
  closeDialog(){
    this.dialog?.closeAll();
  }
  permissionChangen(){

    console.log('permisson', this.userInfo?.permissions);
    this.permissions.set(this.userInfo?.permissions?.length ? JSON.parse(JSON.stringify(this.userInfo?.permissions)) : []);
    this.editPermissionStatus.set(true)
  }
  selectRoleId(role) {

    if (!role?.id) return
    this.selectRoleInfo.set(role)
    // this.form.get('roleId')?.setValue(role.id);
    // console.log(4444, this.form.get('roleId')?.value)
  }
  canceledRole(){
    // if (!this.selectRoleInfo()?.id) {
    console.log("dataa", this?.data?.permissions, "userInfo", this.userInfo?.permissions, "boolead", this.arePermissionsEqual(this?.data?.permissions || [], this.userInfo?.permissions || []))

    this.selectRoleInfo.set({id: this.userInfo?.role?.id, name: this.userInfo?.role?.name, displayName: this.userInfo?.role?.displayName});
    // } else {
      // this.selectRoleInfo.set({id: '', name: '', displayName: ''})
    // }
    this.editRoleStatus.set(false)
    this.saveStatus.set(!this.arePermissionsEqual(this?.data?.permissions || [], this.userInfo?.permissions || []))
    console.log(2222001, this.areRoleEqual())
    // this.permissions.set([])
  }
  // onPermissionChange(item: any, type: string, checked: any) {
  //   item.types[type] = checked?.target?.checked || false;
  //   console.log(77777, this.permissions());
  // }
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
  clearPermissions(){
    this.permissions.set([])
    this.editPermissionStatus.set(false)

    console.log("dataa", this?.data?.permissions, "userInfo", this.userInfo?.permissions, "boolead", this.arePermissionsEqual(this?.data?.permissions || [], this.userInfo?.permissions || []))

    this.saveStatus.set(!this.arePermissionsEqual(this?.data?.permissions || [], this.userInfo?.permissions || []))

  }
  applyPermissions(){
    this.userInfo.permissions = this.permissions()?.length ? JSON.parse(JSON.stringify(this.permissions())) : []
    // this.permissions.set( this.permissionsEditList()?.length ? JSON.parse(JSON.stringify(this.permissionsEditList())) : [])
    this.editPermissionStatus.set(false)
    console.log("dataa", this?.data?.permissions, "userInfo", this.userInfo?.permissions, "boolead", this.arePermissionsEqual(this?.data?.permissions || [], this.userInfo?.permissions || []))

    this.saveStatus.set(!this.arePermissionsEqual(this?.data?.permissions || [], this.userInfo?.permissions || []))

  }
  protected readonly close = close;


   arePermissionsEqual(a: any[], b: any[]): boolean {
     try {
       if (this.data?.role?.id !== this.userInfo?.role?.id) return false;
       if (a.length !== b.length) return false;

       const sortByModule = (arr: any[]) =>
         arr.slice().sort((x, y) => x.module.localeCompare(y.module));

       const arr1 = sortByModule(a);
       const arr2 = sortByModule(b);

       for (let i = 0; i < arr1.length; i++) {
         const item1 = arr1[i];
         const item2 = arr2[i];

         if (item1.module !== item2.module) return false;
         if (item1.moduleName !== item2.moduleName) return false;

         const keys1 = Object.keys(item1.types);
         const keys2 = Object.keys(item2.types);

         if (keys1.length !== keys2.length) return false;

         for (const key of keys1) {
           if (item1.types[key] !== item2.types[key]) {
             return false;
           }
         }
       }

       return true;
     } catch (e) {
       return true;
     }

  }
  areRoleEqual() {
    console.log('areRoleEqual',this.data?.role?.id, "1111",  this.userInfo?.role?.id);
    if (this.data?.role?.id === this.userInfo?.role?.id){
      return false;
    }
     return true;
   }
  clearAllData(){
    this.userInfo = JSON.parse(JSON.stringify(this.data))
    this.saveStatus.set(!this.arePermissionsEqual(this?.data?.permissions || [], this.userInfo?.permissions || []))

  }
   formattedPhone(item): string {
    const phone = item?.phone || ''
    if (!phone) return ""
    const digits = phone.replace(/\D/g, '');
    const nineDigits = digits.slice(-9);

    const operator = nineDigits.slice(0, 2);
    const part1 = nineDigits.slice(2, 5);
    const part2 = nineDigits.slice(5, 7);
    const part3 = nineDigits.slice(7, 9);

    return `+998 ${operator} ${part1} ${part2} ${part3}`;
  }
  copyToClipboard(value) {
    if (!value) return;
    navigator.clipboard.writeText(value);
    this.snackBar.open(`${this.translateService.instant('new.data_copied')} ✅`, this.translateService.instant('notifications.close'), { duration: 3000 });
  }
}
