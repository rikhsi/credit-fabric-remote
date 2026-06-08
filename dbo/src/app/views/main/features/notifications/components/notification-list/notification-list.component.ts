import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit,
  ViewChild
} from '@angular/core';
import {NotificationService} from "../../../../../../core/services/notification.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {NotificationContent} from "../../models/notifications.model";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {UtilsService} from "../../../../../../core/services/utils.service";
import {NotificationItemComponent} from "../notification-item/notification-item.component";
import { PaginatorComponent } from '../../../../../../shared/components/paginator/paginator.component';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
    selector: 'app-notification-list',
    imports: [
        NotificationItemComponent,
        MatPaginator,
        PaginatorComponent,
        RouterLinkActive,
        RouterLink
    ],
    templateUrl: './notification-list.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationListComponent implements OnInit {
  #destroy = inject(DestroyRef);
  isLoading: boolean = false
  pageIndex = 0;
  pageSize = 10;
  totalItems = 0;
  notificationList: NotificationContent[] = [];
  @ViewChild(MatPaginator) paginator!:MatPaginator;

  tabs = [
    {
      title: 'Новости',
      value: 'NEWS',
    },
    {
      title: 'Уведоления',
      value: 'OTHER',
    }
  ];

  tab = '';

  constructor(
    private destroyRef: DestroyRef,
    private _notificationService: NotificationService,
    private _cf: ChangeDetectorRef,
    private _utilsService: UtilsService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    ) {
  }

  ngOnInit(): void {
    this.watchRoute();
    this.watchNotificationRead();
  }

  watchRoute() {
    this.activatedRoute.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(query => {
        this.tab = query['tab'];
        if(!this.tab) {
          this.router.navigate(['/notification','list'],
            {
              queryParams: {
                tab: this.tabs[0].value
              }
            })
        }
        this.getNotifications();
      })
  }

  watchNotificationRead() {
    this._notificationService.read$$
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe(read => {
        this.getNotifications();
      })
  }

  readAll() {
    this._utilsService.spinnerState$$.next(true);
    this._notificationService.notifyReadAll()
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe((res) => {
        this._utilsService.spinnerState$$.next(false);
        if(!res) return;
        this._notificationService.readAll$$.next(true);
        this.getNotifications();
      })
  }

  getNotifications() {
    this.isLoading = true;
    const type = this.tab === 'NEWS' ? 'NEWS' : null;
    this._notificationService.getAllNotifications(
      {page: this.pageIndex, size: this.pageSize},
      type
    )
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe((res)=>{
        if (!res) return
        this.pageIndex = res.number;
        this.totalItems = res.totalElements;
        this.notificationList = res.content
        this.isLoading = false;
        this._cf.detectChanges();
    })
  }

  pageChanged(event: any) {
    this._utilsService.spinnerState$$.next(true);
    this.pageIndex = event.page;
    this.pageSize = event.size;
    this.getNotifications();
  }
}
