import { CommonModule, DatePipe, NgOptimizedImage, registerLocaleData } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {RouterModule} from '@angular/router';
import {Subject, take, takeUntil} from 'rxjs';
import {AuthService} from 'src/app/views/auth/services/auth.service';

import {UserService} from '../../services/user.service';
import {UtilsService} from '../../services/utils.service';
import {UiSvgIconComponent} from '../ui-svg-icon/ui-svg-icon.components';
import {MatRipple} from "@angular/material/core";
import {RightBarService} from "../../../views/main/right-bar/services/right-bar.service";
import localeRu from '@angular/common/locales/ru';
import {NotificationService} from "../../services/notification.service";
import { EspSignConfirmService } from '../../services/esp-confirm.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {MatDivider} from "@angular/material/divider"; // Import locale data for Russian

@Component({
    selector: 'app-header',
    imports: [CommonModule, UiSvgIconComponent, RouterModule, MatButtonModule, MatMenuModule, MatIcon, MatRipple, NgOptimizedImage, MatDivider],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    providers: [DatePipe],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit {
  formattedDate: string | null = null;
  count:number = 0
  constructor(
    private destroyRef: DestroyRef,
    private _authService: AuthService,
    public userService: UserService,
    public utilsService: UtilsService,
    private rightBarService:RightBarService,
    private cf:ChangeDetectorRef,
    private datePipe: DatePipe,
    private notificationService:NotificationService,
    public espConfirmService: EspSignConfirmService,
  ) {
    registerLocaleData(localeRu)
  }

  ngOnInit(): void {
    this.getUserInfo();
    // this.getNotifyCount();
    // this.getDirectorInfo();
    // this.getHeadOfFinanceInfo();
    // this.watchRead();
    // this.watchNewNotification();
  }

  watchNewNotification() {
    this.notificationService.reportsReady$$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(notify => {
        this.getNotifyCount();
      })
  }

  getUserInfo() {
    this._authService.getUserInfoV2()
      .pipe(take(1))
      .subscribe(res => {
        this.userService.userInfo$$.next(res);
        localStorage.setItem("businessInfo", JSON.stringify(res));
      });

    // this.rightBarService.getOperDay().pipe(take(1)).subscribe(res => {
    //   if (!res) return;
    //
    //   let selected = res.currentWorkingDate
    //     ? this.parseDate(res.currentWorkingDate)
    //     : new Date();
    //   if (selected){
    //     this.formattedDate = this.datePipe.transform(selected, 'd MMMM y', '','ru-RU');
    //   }
    //   this.cf.detectChanges()
    // });
  }

  getDirectorInfo() {
    this._authService.getUserByRole(['DIRECTOR'])
      .pipe(take(1))
      .subscribe(res => {
        if(res) {
          if(!res.content.length) return;
          const director = res.content[0];
          this.userService.director$$.next(director);
        }
      });
  }

  getHeadOfFinanceInfo() {
    this._authService.getUserByRole(['HEAD_OF_FINANCE'])
      .pipe(take(1))
      .subscribe(res => {
        if(!res.content.length) return;
        const headOfFinance = res.content[0];
        this.userService.headOfFinance$$.next(headOfFinance);
      });
  }

  private parseDate(dateString: any): Date {
    const parts = dateString.split('.');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Months are zero-based in JavaScript Date
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return new Date(NaN); // Invalid Date if parsing fails
  }

  getGreet() {
    const date = new Date()
    let hours  = date.getHours()
    if (hours >= 5 && hours < 12) {
      return 'Доброе утро';
    } else if (hours >= 12 && hours < 17) {
      return 'Добрый день';
    } else if (hours >= 17 && hours < 21) {
      return 'Добрый вечер';
    } else {
      return 'Доброй ночи';
    }
  }


  watchRead() {
    this.notificationService.readAll$$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(read => {
        this.getNotifyCount();
      });

    this.notificationService.read$$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(read => {
        this.getNotifyCount();
      });
  }

  getNotifyCount(){
    this.notificationService.getCount()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res)=>{
        if (!res) return;
        this.count = res.msg
        this.cf.detectChanges()
    })
  }

}
