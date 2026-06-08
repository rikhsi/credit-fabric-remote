import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  signal,
  TemplateRef,
  ViewChild
} from "@angular/core";
import {MatDialog, MatDialogClose, MatDialogRef} from "@angular/material/dialog";
import {MatDivider} from "@angular/material/divider";
import {NgClass, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {AccountService} from "../../../../services/account.service";
import {debounceTime, take} from "rxjs";
import {NewNotification, UserDataDto} from "../../../../models/user.model";
import {Route, Router, RouterModule} from "@angular/router";
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatChip, MatChipRemove} from "@angular/material/chips";
import {MatMenu, MatMenuModule} from "@angular/material/menu";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {InfiniteScrollDirective} from "ngx-infinite-scroll";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {IconComponent} from "../../../../../shared/ui/icon/icon.component";
import {SvgIconComponent} from "../../../../../shared/components/svg-icon/svg-icon.component";
import {MAIN_COMPONENT_PRODUCTS} from "../../../../../views/main/features/new-main/constants/new-main.const";
import {NewSettingsService} from "../../../../../views/main/features/new-settings/services/new-settings.service";
import {ToastrService} from "ngx-toastr";
import {AccountStore} from "../../../../../store/account.store";


@Component({
  selector: "app-notifications-dialog",
  templateUrl: "./notifications-dialog.component.html",
  styleUrls: ["./notifications-dialog.component.scss"],
  standalone: true,
  imports: [
    MatDialogClose,
    MatDivider,
    NgForOf,
    NgIf,
    NgClass,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatChip,
    MatChipRemove,
    MatMenu,
    NgOptimizedImage,
    MatMenuModule,
    InfiniteScrollDirective,
    TranslateModule,
    IconComponent,
    SvgIconComponent
  ]
})

export class NotificationsDialogComponent implements OnInit {
  @ViewChild('dialogNotifyDetail') dialogNotifyDetail!: TemplateRef<any>;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  private readonly accountService = inject(AccountService)
  activeTabIndex = signal<number>(1)
  #destroy = inject(DestroyRef)
  search = new FormControl('');
  pageIndex = signal<number>(0)
  totalPage = signal<number>(0)

  data= {notifications: []}
  notificationList =signal<any>([]);
  allNotificationList =signal<any>([]);
  usetInfoItem= <UserDataDto>{};
  isLoading = signal<boolean>(false);
  refreshCount = signal<number>(1);
  dateSelectCount = signal<number>(0);
  selectNotification= signal<any>(null)
  selectLegalCritical= signal<any>(null)
  unReadCount= signal<number>(0)
  statusItem= signal<string[]>([])
  dateFrom=''
  dateTo=''
  tabMenu = [
    { id: 1, key: '', name: `${this.translate.instant('notifications.all')}` },
    { id: 2, key: 'READ',  name: 'Прочитанные'},
    { id: 3, key: 'UNREAD', name: 'Непрочитанные'},
  ];

  categoryMenu = [
    { id: 1, key: 'TRANSACTION', name: `Платежи` },
    { id: 2, key: 'SYSTEM',  name: 'Системные'},
    { id: 3, key: 'NEWS', name: 'Новости'},
    { id: 3, key: 'LEGAL', name: 'Юридические'},
  ];
  filterForm = signal<any>({
    search: "",
    dateFrom: "",
    dateTo: "",
    categoryList: []
  })
  dialogRef!: MatDialogRef<any>;
  readonly accountStore = inject(AccountStore)
  constructor(
    private router: Router,
    private matDialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private translate:TranslateService,
    private newSettingsService: NewSettingsService,
    private translateService: TranslateService,
    private toastrService: ToastrService,
    private dialog: MatDialog,
  ) {
  }
 ngOnInit() {
  console.log(4444400)
  this.usetInfoItem = JSON.parse(localStorage.getItem('user')!) as UserDataDto;
  this.loadNotificationList()
  this.loadNotificationUnReadCount()

   this.search.valueChanges.pipe(
     debounceTime(300),
     takeUntilDestroyed(this.#destroy)
   ).subscribe(value => {
     const searchValue = value?.toLowerCase() ?? '';
     this.loadNotificationList()
     this.loadNotificationUnReadCount()
   });

}

  loadNotificationUnReadCount(){
    this.accountService.getNotificationUnReadCount()
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          console.log(4522, res)
            if (res.success) {
              this.accountStore.unreadCount.set(res?.result?.data?.count || 0);
            } else {
              this.accountStore.unreadCount.set(0);
            }
          },
        error: (err) => {
          this.accountStore.unreadCount.set(0);
          console.log("ERROR", err);
        }
      });
  }
  loadNotificationList (){
   if(!this.usetInfoItem?.userId) return
    this.isLoading.set(true);
    const currentPage = this.pageIndex();
    this.accountService.userNotificationList({uuid: this.usetInfoItem.userId, page: currentPage, size: 20, ...this.filterForm(), status: this.statusItem()})
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          if (currentPage === 0) {
            this.notificationList.set(res && res?.content?.length ? this.groupNotifications(res.content) : [])
            this.allNotificationList.set(res && res?.content?.length ? res.content : [])
          } else {
            this.allNotificationList.set([...this.allNotificationList(), ...(res?.content || [])])
            this.notificationList.set(res && res?.content?.length ? this.groupNotifications(this.allNotificationList()) : [])
          }

          this.isLoading.set(false);
          this.totalPage.set(res?.totalPages || 0)
        },
        error: (err) => {
          console.log("ERROR", err);
          this.isLoading.set(false);
        }
      });
  }
  formatRussianDate(input: string): string {
    const timePart = input.split(" ")[1];
    const hasSeconds = timePart?.split(":").length >= 3;

    if (!hasSeconds) return "";
    const date = new Date(input);

    const day = date.getDate().toString().padStart(2, '0');

    const month = new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(date);

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day} ${month},${hours}:${minutes}`;
  }

  goToNotification(){
    this.matDialog.closeAll();
    this.router.navigate(['/settings/notifications']);
  }
  closeLegalCritical(){
    this.selectLegalCritical.set(null)
    this.dialogRef.close()
  }
  readLegalCritical(){
    if(!this.selectLegalCritical()?.id) return
    this.readNotify(this.selectLegalCritical(), 'legal')
    this.dialogRef.close()
  }
  selectNotificationChange(item){
    if (item?.status === 'LEGAL') {
      this.selectLegalCritical.set(item || null);
      this.dialogRef =  this.dialog.open(this.dialogNotifyDetail, {
        panelClass: 'header-notifications-dialog',
        width: '540px',
      });
      return;
    }

    console.log(53342, item)
    this.selectNotification.set(item || null);
    if (item?.status === 'READ') return
    const ids = [item.id]
    console.log(888888, ids)
    this.readNotify(item)

  }
  readNotify(item, name=''){
    this.accountService.setReadNotification({ids: [item.id]})
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          if (res.success) {
            item.status = 'READ';
            console.log(2220011,  item)
            this.loadNotificationUnReadCount()
            this.refreshCount.set(this.refreshCount() + 1);
            if (name === 'legal') {
              const msg = this.translateService.instant(`settings.success`) || ''
              this.dialogRef.close()
              this.toastrService.success(msg.toString());
            }
          }
        },
        error: (err) => {

        }
      });
  }
  changeTab(item) {
    if (!item.id) return
    this.pageIndex.set(0)
    this.scrollContainerTop()
    this.activeTabIndex.set(Number(item.id));
    const status = item?.key ? [item?.key] : [];
    this.statusItem.set(status);
    // this.filterForm.set({...this.filterForm(), status});
    this.allNotificationList.set([])
    this.changeFilter()
  }
  scrollContainerTop() {
    this.scrollContainer.nativeElement.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
  groupNotifications(data: NewNotification[]) {
    const important = data.filter(n => ((n.type == "LEGAL" || n.type === 'LEGAL_CRITICAL') && n.status === "UNREAD"))
      .sort((a, b) => new Date(b.sendTime).getTime() - new Date(a.sendTime).getTime());

    const unimportant = data.filter(n => (!((n.type == "LEGAL" || n.type === 'LEGAL_CRITICAL') && n.status === "UNREAD")))
      .sort((a, b) => new Date(b.sendTime).getTime() - new Date(a.sendTime).getTime());

    const result: any[] = [];
    if (important.length > 0) {
      result.push({
        status: "IMPORTANT",
        items: important
      });
    }

    const unimportantGrouped = unimportant.reduce((acc, item) => {
      const dateKey = item.sendTime.split(" ")[0];
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, items: [] as NewNotification[] };
      }
      acc[dateKey].items.push(item);
      return acc;
    }, {} as Record<string, { date: string; items: NewNotification[] }>);

    result.push(...Object.values(unimportantGrouped));
    console.log(2000234, result);
    return result;
  }

  //   return Object.entries(
  //     data.reduce((acc, item) => {
  //       const dateKey = item.sendTime.split(" ")[0];
  //
  //       if (!acc[item.status]) {
  //         acc[item.status] = {};
  //       }
  //
  //       if (!acc[item.status][dateKey]) {
  //         acc[item.status][dateKey] = { date: dateKey, items: [] };
  //       }
  //
  //       acc[item.status][dateKey].items.push(item);
  //
  //       return acc;
  //     }, {} as Record<string, Record<string, { date: string; items: NewNotification[] }>>)
  //   ).map(([status, groups]) => ({
  //     status,
  //     groups: Object.values(groups)
  //   }));
  // }

  // newDateFormat(dateStr: string) {
  //   if (!dateStr) return '';
  //
  //   const date = new Date(dateStr);
  //   const today = new Date();
  //
  //   const isToday =
  //     date.getFullYear() === today.getFullYear() &&
  //     date.getMonth() === today.getMonth() &&
  //     date.getDate() === today.getDate();
  //
  //   if (isToday) {
  //     return `${this.translate.instant('notifications.today_alt')}`;
  //   }
  //   return new Intl.DateTimeFormat('ru-RU', {
  //     day: 'numeric',
  //     month: 'long'
  //   }).format(date);
  // }

  // newDateFormat(dateStr: string) {
  //   if (!dateStr) return '';
  //
  //   const date = new Date(dateStr);
  //   const today = new Date();
  //
  //   const isToday =
  //     date.getFullYear() === today.getFullYear() &&
  //     date.getMonth() === today.getMonth() &&
  //     date.getDate() === today.getDate();
  //
  //   if (isToday) {
  //     return this.translate.instant('notifications.today_alt');
  //   }
  //
  //   const lang = this.translate.currentLang || 'ru';
  //   console.log("232323", lang)
  //
  //   const localeMap: Record<string, string> = {
  //     ru: 'ru-RU',
  //     'uz-Latn': 'uz-UZ',
  //     'uz-Cyrl': 'uz-Cyrl-UZ',
  //     en: 'en-US'
  //   };
  //
  //   const locale = localeMap[lang] || 'ru-RU';
  //
  //
  //   return new Intl.DateTimeFormat(locale, {
  //     day: 'numeric',
  //     month: 'long'
  //   }).format(date);
  // }

  newDateFormat(dateString: string): string {
    if (!dateString) return '';

    const datePart = dateString.split(' ')[0];

    const parts = datePart.split('-');
    if (parts.length !== 3) return '';

    const year = parts[0];
    const month = parts[1];
    const day = parts[2];

    const translateMonths = [
      'months.january',
      'months.february',
      'months.march',
      'months.april',
      'months.may',
      'months.june',
      'months.july',
      'months.august',
      'months.september',
      'months.october',
      'months.november',
      'months.december'
    ];

    const monthIndex = Number(month) - 1;

    if (monthIndex < 0 || monthIndex > 11) return '';

    const monthKey = translateMonths[monthIndex];
    const monthName = this.translate.instant(monthKey);

    return `${Number(day)} ${monthName}`;
  }


  readAll(){
      this.accountService.setNotificationUnReadAll()
        .pipe(take(1))
        .subscribe({
          next: (res) => {
            if (res?.success) {
              const msg = this.translateService.instant(`settings.success`) || ''
              this.dialogRef.close()
              this.toastrService.success(msg.toString());
              this.selectNotification.set(null)
              this.allNotificationList.set([])
              this.pageIndex.set(0)
              this.loadNotificationUnReadCount()
              this.loadNotificationList()
            }

          },
          error: (err) => {

          }
        });
    }

  changeDate(item: number) {
    if (!item) return;

    this.dateSelectCount.set(item);

    const today = new Date();

    let from: Date | null = null;
    let to: Date | null = null;

    if (item === 1) {
      from = new Date(today);
      to = new Date(today);
    }

    else if (item === 2) {
      to = new Date(today);

      from = new Date(today);
      from.setDate(today.getDate() - 7);
    }

    else if (item === 3) {
      to = new Date(today);

      from = new Date(today);
      from.setMonth(today.getMonth() - 1);
    }

    if (from && to) {
      this.filterForm.set({
        ...this.filterForm(),
        dateFrom: this.formatDate(from),
        dateTo: this.formatDate(to)
      });

      this.changeFilter();
    } else {
      console.warn('⚠ changeDate: Unknown item value', item);
    }
  }


  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }
  changeFilter() {
    console.log(1111, this.allNotificationList().length);
    this.pageIndex.set(0)
    this.allNotificationList.set([])
    this.notificationList.set([])
    this.scrollContainerTop()
    this.loadNotificationList()

  }
  onScroll(){
    console.log('scroll', 11);
    if (this.pageIndex() >= (this.totalPage() -1)) {
      return;
    }
    this.pageIndex.set(this.pageIndex() + 1);
    this.loadNotificationList()
  }

  hasAnyFilter(): boolean {
    const value = this.filterForm();
    // console.log(45551, value)
    return Object.keys(value).some(key => {
      const val = value[key];
      return val !== null && val !== undefined && val !== '' && val.length !== 0;
    });
  }
  clearAllFilters(){
    console.log('clearAllFilters');
    this.filterForm.set({
      search: "",
      dateFrom: "",
      dateTo: "",
      categoryList: []
    })
    this.dateSelectCount.set(0)
    this.changeFilter()
  }
  searchText(event){
    const text = event?.target?.value;
      this.filterForm.set({...this.filterForm(), search: text})
      this.changeFilter()

  }
  imageUrls(notify) {
    const url = notify?.data?.logo?.path + notify?.data?.logo?.name;
    return url;
  }
  bgIconStatus(notify) {
    return  !notify?.data?.success
  }

  deleteOneNotify(){
    console.log('weewew')
    const ids = this.selectNotification()?.id ? [this.selectNotification()?.id] : []
    if (!ids.length) return
    this.newSettingsService.deleteNotificationItem({ids}).pipe(take(1)).subscribe({
      next: (res: any) => {
        console.log(5555, res)
        if (res?.success) {
          const msg = this.translateService.instant(`settings.success`) || ''
          this.dialogRef.close()
          this.toastrService.success(msg.toString());
          this.selectNotification.set(null)
          this.allNotificationList.set([])
          this.loadNotificationList()
        } else {
          const mg = res.result?.message || '';
          this.toastrService.error(mg || "Произошла ошибка.");

        }
      }
    })

  }
  deleteAllNotify(){
    console.log('weewew')

    this.newSettingsService.deleteAllNotificationItem().pipe(take(1)).subscribe({
      next: (res: any) => {
        if (res?.success) {
          const msg = this.translateService.instant(`settings.success`) || ''
          this.dialogRef.close()
          this.toastrService.success(msg.toString());
          this.selectNotification.set(null)
          this.allNotificationList.set([])
          this.loadNotificationList()
          this.loadNotificationUnReadCount()
        } else {
          const mg = res.result?.message || '';
          this.toastrService.error(mg || "Произошла ошибка.");

        }
      }
    })

  }
  clearDateFilter(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.dateSelectCount.set(0);
    this.filterForm.set({...this.filterForm(), dateFrom: '', dateTo: ''})

    this.changeFilter()
  }
  clearCategoryFilter(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.filterForm.set({...this.filterForm(), categoryList: []})
    this.changeFilter()
  }
  categoryChange(category) {
    if (category?.key) {
      this.filterForm.set({...this.filterForm(), categoryList:[category.key]})
       this.changeFilter()
    }
  }
  getCategoryName(): string {
    const key = this.filterForm()?.categoryList?.length ? this.filterForm().categoryList[0] : "";
    if (!key) return "";
    const found = this.categoryMenu.find(item => item.key === key);
    return found ? found.name : '';
  }
  closeAllDialog () {
    this.dialog.closeAll();
  }
  deleteOneNotifyDialog(template: TemplateRef<any>): void {
    this.dialogRef = this.dialog.open(template, {
      panelClass: 'header-notifications-dialog',
      width: '480px',
    });
  }
  deleteAllNotifyDialog(template: TemplateRef<any>): void {
    this.dialogRef = this.dialog.open(template, {
      panelClass: 'header-notifications-dialog',
      width: '480px',
    });
  }
  readAllDialog(template: TemplateRef<any>): void {
    this.dialogRef = this.dialog.open(template, {
      panelClass: 'header-notifications-dialog',
      width: '480px',
    });
  }
  detailFooterBtnStatus() {
    if (this.selectNotification()?.data?.mode && Object.keys(this.selectNotification()?.data).length !== 0 && (this.selectNotification()?.type === 'LEGAL_CRITICAL' || this.selectNotification()?.type === 'GENERAL')) {
      return true
    }
    return false
  }
  redirectUrl() {
    const actionId = this.selectNotification()?.data?.uuid

   if (this.selectNotification()?.data?.mode === 'AUTO_PAY' || this.selectNotification()?.data?.mode === 'TRANSACTION_CORP_CARD' || this.selectNotification()?.data?.mode === 'TRANSACTION_SALARY' || this.selectNotification()?.data?.mode === 'TRANSACTION' || this.selectNotification()?.data?.mode === 'TRANSACTION_MUNIS') {
     if (!actionId)  return;
     this.router.navigate(
       ['/main'],
       { queryParams: { dialogAction: 'on', type:'transaction',  actionId } }
     );
     this.dialog.closeAll();
   } else if (this.selectNotification()?.data?.mode === 'KARTOTEKA') {
     this.router.navigate(['/kartoteka/list/kartoteka-2']);
     this.dialog.closeAll();
   } else if (this.selectNotification()?.data?.mode === 'TRANSACTION_REPORT') {
     this.router.navigate(['/reports/list']);
     this.dialog.closeAll();
   }
   else if (this.selectNotification()?.data?.mode === 'CARD_LIMIT') {
          if (!actionId)  return;
          this.router.navigate(
           ['/corp-card-project/corp-card-details', actionId],
            { queryParams: { dialogAction: 'on', type:'limit' } }
     );
     this.dialog.closeAll();
   }
   else if (this.selectNotification()?.data?.mode === 'ACCOUNT_BLOCK' || this.selectNotification()?.data?.mode === 'ACCOUNT_UNBLOCK') {
      this.router.navigate(['/accounts?tab=ALL']);
      this.dialog.closeAll();
    }
   else if (this.selectNotification()?.data?.mode === 'CARD_BLOCK' || this.selectNotification()?.data?.mode === 'CARD_UNBLOCK') {
     this.router.navigate(['/corp-card-project/corp-cards?tab=All_CARDS']);
     this.dialog.closeAll();
   }
   else if (this.selectNotification()?.data?.mode === 'TRUSTED_DEVICE') {
     this.router.navigate(['/settings/security'], { queryParams: { dialogAction: 'on' } });
     this.dialog.closeAll();
   }
   else if (this.selectNotification()?.data?.mode === 'STYX') {
     this.router.navigate(['//settings/e-signature']);
     this.dialog.closeAll();

   }
  }
  protected readonly MAIN_COMPONENT_PRODUCTS = MAIN_COMPONENT_PRODUCTS;
}

