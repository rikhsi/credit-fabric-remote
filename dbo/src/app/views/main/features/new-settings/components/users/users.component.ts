import {Component, inject, OnDestroy, OnInit, signal, TemplateRef, ViewChild} from "@angular/core";
import {Router} from "@angular/router";
import {MatDialogClose, MatDialogContent} from "@angular/material/dialog";
import {MatDivider} from "@angular/material/divider";
import {QRCodeComponent} from "angularx-qrcode";
import {MatIcon} from "@angular/material/icon";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {Subscription, take} from "rxjs";
import {AuthService} from "../../../../../auth/services/auth.service";
import {UserInfoDto} from "../../../../../../core/models/user.model";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {UiSvgIconComponent} from "../../../../../../core/components/ui-svg-icon/ui-svg-icon.components";
import {EmailCodeDialogComponent} from "../settings-dialogs/email-code-dialog/email-code-dialog.component";
import {SessionsDialogComponent} from "../settings-dialogs/sessions-dialog/sessions-dialog.component";
import {UserInfoDialogComponent} from "../settings-dialogs/user-info-dialog/user-info-dialog.component";
import {NewSettingsService} from "../../services/new-settings.service";
import {UserCreateDialogComponent} from "../settings-dialogs/user-create-dialog/user-create-dialog.component";
import {RoleDto, SettingUserInfoDto} from "../../models/settings.model";
import {LoanDetail} from "../../../loans/models/loan.model";
import {ToastrService} from "ngx-toastr";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {NgxMaskPipe} from "ngx-mask";
import { TranslateModule } from '@ngx-translate/core';


@Component({
  selector: "app-organization",
  templateUrl: "./users.component.html",
  styleUrls: ["./users.component.scss"],
  imports: [
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    NgForOf,
    MatTabGroup,
    MatTab,
    NgxMaskPipe,
    NgClass,
    MatDialogClose,
    TranslateModule
  ]
})

export class UsersComponent implements OnInit, OnDestroy {
  private subscription!: Subscription;
  private toastrService = inject(ToastrService)
  activeTabIndex = 1
  data= {}
  dialogRef!: MatDialogRef<any>;
  selectionUserId!: string;
  userItems = signal<any>([]);
  notApprovedUserItems = signal<any>(null);
  directorId = signal<string>('');
  errorMessage = signal<string>('');
  isLoading = signal(false);
  currentUser = signal<any>({});
  roleList: RoleDto[] | null = null;
  oneUserInfo  = null;
  tabMenu = [
    { id: 1, name: 'Пользователи' },
    { id: 2, name: 'Новые пользователи' },
  ];


  constructor(
    public router: Router,
    private dialog: MatDialog,
    private authService: AuthService,
    private newSettingsService: NewSettingsService,
  ) {}
  ngOnInit() {
    this.subscription = this.newSettingsService.refresh$.subscribe(trigger => {
      const userInfo = localStorage.getItem("user") ||  null;
      this.directorId.set(userInfo ? JSON.parse(userInfo)?.userId : '') ;
      console.log(55555, this.directorId())
      this.loadUserList()
      // this.loadUserNotApprovedList()
      this.loadRoleList()
    });

  }

  loadUserList() {
    this.isLoading.set(true)
    this.newSettingsService.getUserList()
      .pipe(take(1))
      .subscribe({
      next: res => {
        console.log(4444, res)
        this.userItems.set( res?.result?.data?.content || []);
        this.errorMessage.set(!res?.success ? res?.result?.message : "")
        this.isLoading.set(false)
        if (this.userItems().length) {
          const user = this.userItems().find(item => item?.currentUser);
          this.currentUser.set(user)
          console.log(6666, this.currentUser())
        }
      },
      error: (err: any) => {
        this.userItems.set( []);
        this.isLoading.set(false)
        console.log(555, err)
      }
    });
  }
  loadUserNotApprovedList() {
    this.newSettingsService.getNotApprovedUserList({page:0, size: 500})
      .pipe(take(1))
      .subscribe(res => {
        this.notApprovedUserItems.set(res?.content || null);
      });
  }
  loadRoleList() {
    this.newSettingsService.getUserRoleList()
      .pipe(take(1))
      .subscribe(res => {
        this.roleList = res;
      });
  }
  loadUserInfo(user) {
    console.log(user);
    if (!user.uuid) return
    this.newSettingsService.getUserInfo({uuid: user.uuid})
      .pipe(take(1))
      .subscribe(res => {
        if (res) {
          this.openUserInfoDialog(res)
        } else {
          this.toastrService.error("Произошла ошибка.");
        }
        console.log(1234, res)
      });
  }

  openUserInfoDialog(info: SettingUserInfoDto){
    console.log(41111, info)
    this.dialog.closeAll()
    this.dialog.open(UserInfoDialogComponent, {
      data: {...info, roles: this.roleList},
      width: '517px',
      height: 'calc(100% - 16px)',
      position: {
        right: '0',
      },
      panelClass: 'right-side-dialog',
    })
  }
  openUserCreateDialog(){
    this.dialog.closeAll()
    this.dialog.open(UserCreateDialogComponent, {
      data: {roles:  this.roleList},
      width: '517px',
      height: 'calc(100% - 16px)',
      position: {
        right: '0',
      },
      panelClass: 'right-side-dialog',
      disableClose: true
    })
  }
  changeTab(id: number) {
    this.activeTabIndex = id;
  }

  deleteUser(): void {
    if (this.selectionUserId) {
      this.newSettingsService.deleteNotApprovedUser({id: this.selectionUserId})
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
  closeDialog(){
    this.dialogRef?.close();
    this.dialog.closeAll()
  }
  successUserCreate(){
    this.toastrService.success('Успешно!');
    this.newSettingsService.triggerRefresh()
  }

  openBlockDialog(template: TemplateRef<unknown>, userId: string): void {
    this.selectionUserId = ''
    if (!userId) return
    this.selectionUserId = userId;
    this.dialogRef = this.dialog.open(template, {
      width: '359px',
      disableClose: true,
      panelClass: 'custom-block-dialog'
    });
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
