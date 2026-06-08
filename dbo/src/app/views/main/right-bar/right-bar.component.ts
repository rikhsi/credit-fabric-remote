import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, DestroyRef, inject,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import {Subject, take, takeUntil} from 'rxjs';

import { ExchangeRatesComponent } from './exchange-rates/exchange-rates.component';
import { RightBarService } from './services/right-bar.service';
import {MatButton} from "@angular/material/button";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {NgxMaskPipe} from "ngx-mask";
import {AccountsPaymentsService} from "../features/accounts-payments/services/accounts-payments.service";
import {NotificationService} from "../../../core/services/notification.service";
import {NotificationContent} from "../features/notifications/models/notifications.model";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {ToastrService} from "ngx-toastr";
import {RouterLink} from "@angular/router";
import {UiSvgIconComponent} from "../../../core/components/ui-svg-icon/ui-svg-icon.components";
import {UtilsService} from "../../../core/services/utils.service";
import { EventCalendarComponent } from './components/full-calendar/event-calendar.component';

@Component({
    selector: 'app-right-bar',
    imports: [
        CommonModule,
        ExchangeRatesComponent,
        MatCardModule,
        MatDatepickerModule,
        MatIconModule,
        MatRippleModule,
        MatButton,
        MatMenu,
        MatMenuItem,
        NgxMaskPipe,
        MatMenuTrigger,
        RouterLink,
        EventCalendarComponent,
    ],
    templateUrl: './right-bar.component.html',
    styles: [
        `
      .mat-calendar-table-header-divider::after {
        display: none;
      }
      .mat-calendar-body-label {
        opacity: 0;
      }
      .mat-calendar-body-label[colspan='7'] {
        display: none;
      }
      .mat-calendar-next-button::after,
      .mat-calendar-previous-button::after {
        color: #007aff;
      }
      .mat-h4,
      .mat-body-1,
      .mat-typography .mat-h4,
      .mat-typography .mat-body-1,
      .mat-typography h4 {
        margin: 0;
      }
      .text-p {
        margin: 0;
      }
    `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class RightBarComponent implements OnInit {
  isLoading = false
  currency = 'UZS'
  currencyList: Array<string> = ['UZS', 'USD', 'RUB', 'EUR', 'KZT', 'GBP', 'AED', 'JPY', 'CHF']
  #destroy = inject(DestroyRef);
  balance: any
  notificationList:NotificationContent[]=[]
  selected!: Date | null;
  constructor(
    private rightBarService: RightBarService,
    private accountPaymentService: AccountsPaymentsService,
    private cf: ChangeDetectorRef,
    private notificationService:NotificationService,
    private toast:ToastrService,
    public utilService:UtilsService

  ) {}

  ngOnInit(): void {
    this.getAllBalance()
    this.rightBarService.getOperDay().pipe(take(1)).subscribe(res => {
      if (!res) return;
      this.selected = res.currentWorkingDate || new Date();
    })
    this.getNotificationList()
  }


  getCurrency(currency: string) {
    this.currency = currency
    this.getAllBalance()
  }
  getAllBalance() {
    this.isLoading = true
    this.accountPaymentService.getTotalBalance(this.currency).pipe(takeUntilDestroyed(this. #destroy)).subscribe((res) => {
      this.balance = res;
      this.isLoading = false
      this.cf.markForCheck();
    })

  }

  getNotificationList(paging = {page:0, size:5}){
    this.notificationService.getAllNotifications(paging).pipe(takeUntilDestroyed(this.#destroy)).subscribe((res)=>{
      if (!res) return
      this.notificationList = res.content.filter(value => value.status === 'UNREAD')
      this.cf.detectChanges()
    })
  }

  readAllNotification(){
    this.notificationService.notifyReadAll().pipe(takeUntilDestroyed(this.#destroy)).subscribe((res)=> {
      if (!res) return
      this.toast.success(res.msg)
      this.cf.detectChanges()
    })
  }

}
