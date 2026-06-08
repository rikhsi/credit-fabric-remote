import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component, NgZone, OnDestroy, OnInit,
  ViewEncapsulation,
} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {FormControl, FormGroup, FormsModule} from '@angular/forms';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatTabsModule} from '@angular/material/tabs';
import {UiSvgIconComponent} from 'src/app/core/components/ui-svg-icon/ui-svg-icon.components';
import {MatRippleModule} from '@angular/material/core';
import {Subject, takeUntil} from "rxjs";
import {NgxMaskPipe} from "ngx-mask";
import {MatButton} from "@angular/material/button";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {AccountsPaymentsService} from "../accounts-payments/services/accounts-payments.service";
import {AccountsDto, BannerDto, TransactionContent} from "../accounts-payments/models/accounts-payments.model";
import {RouterLink} from "@angular/router";
import {MatDivider} from "@angular/material/divider";
import {MatCheckbox} from "@angular/material/checkbox";
import { AccountService } from '../../../../core/services/account.service';

@Component({
    selector: 'app-main',
    imports: [
        CommonModule,
        UiSvgIconComponent,
        MatIconModule,
        MatTabsModule,
        MatSelectModule,
        MatDatepickerModule,
        MatInputModule,
        FormsModule,
        MatRippleModule,
        NgxMaskPipe,
        MatButton,
        MatMenuTrigger,
        MatMenu,
        MatMenuItem,
        RouterLink,
        MatDivider,
        MatCheckbox,
        NgOptimizedImage,
    ],
    templateUrl: './dashboard.component.html',
    styles: [
        `
      h3 {
        margin: 0;
      }

      .outer-tab {
        .mat-mdc-tab.mdc-tab {
          margin-right: 16px;
        }

        .mat-tab-header {
          border-bottom: none !important;
        }

        .mdc-tab-indicator .mdc-tab-indicator__content {
          display: none;
        }

        .mat-mdc-tab.mdc-tab--active:focus .mdc-tab__text-label,
        .mat-mdc-tab.mdc-tab--active .mdc-tab__text-label {
          color: #007aff;
        }

        .mat-mdc-tab .mdc-tab-indicator__content--underline {
          border-color: #007aff !important;
        }

        .mat-mdc-tab .mdc-tab__text-label {
          color: #000;
        }

        .mdc-tab {
          padding-left: 8px;
          padding-right: 8px;
          min-width: min-content;
        }
      }

      .inner-tab {
        .mat-mdc-tab.mdc-tab--active:focus .mdc-tab__text-label,
        .mat-mdc-tab.mdc-tab--active .mdc-tab__text-label {
          color: #000;
        }

        .mdc-tab-indicator .mdc-tab-indicator__content {
          display: inherit;
          margin-bottom: -2px;
        }

        .mat-mdc-tab-body-wrapper {
          margin-top: 16px;
        }

        .mat-mdc-tab-labels {
          border-bottom: 2px solid #dbdbdb;
        }

        .mat-mdc-tab.mdc-tab {
          height: 35px;
        }
      }

      .filter {
        .mat-mdc-form-field-flex {
          height: 44px;
        }

        .mat-mdc-form-field-infix {
          min-height: 44px;
        }

        .mat-mdc-text-field-wrapper.mdc-text-field--outlined
        .mat-mdc-form-field-infix {
          padding-top: 10px;
          padding-bottom: 0;
        }

        .mdc-text-field--no-label:not(.mdc-text-field--outlined):not(
            .mdc-text-field--textarea
          )
        .mat-mdc-form-field-infix {
          padding-top: 10px;
          padding-bottom: 0;
        }

        .mdc-text-field--no-label:not(.mdc-text-field--textarea)
        .mat-mdc-form-field-input-control.mdc-text-field__input,
        .mat-mdc-text-field-wrapper .mat-mdc-form-field-input-control {
          text-align: left;
        }

        &.date
        .mdc-text-field--no-label:not(.mdc-text-field--textarea)
        .mat-mdc-form-field-input-control.mdc-text-field__input,
        .filter .mat-mdc-text-field-wrapper .mat-mdc-form-field-input-control {
          text-align: center;
        }
      }


      .carousel {
        position: relative;
        width: 100%;
        height: 250px;
        margin-bottom: 20px;
      }

      .carousel-inner {
        position: relative;
        height: 100%;
      }

      .carousel-item {
        position: absolute;
        width: 100%;
        height: 100%;
        opacity: 0;
        transition: opacity 0.5s ease-in-out;
      }

      .carousel-item.opacity-100 {
        opacity: 1;
      }

      .dots {
        position: absolute;
        bottom: 10px;
        width: 100%;
        display: flex;
        justify-content: center;
      }

      .dot {
        cursor: pointer;
        background-color: #bbb;
        border: none;
        border-radius: 50%;
        display: inline-block;
        margin: 0 5px;
        width: 15px;
        height: 15px;
      }

      .dot.bg-blue-500 {
        background-color: #3b82f6;
      }

      .dot.bg-gray-300 {
        background-color: #d1d5db;
      }
    `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit, OnDestroy {
  currency = 'UZS'
  balance: any
  unsub$ = new Subject<void>();
  isLoading = false
  isLoadingAccount = false
  accounts: AccountsDto[] | undefined;
  transactionsList: TransactionContent[] = [];
  templateList: TransactionContent[] = [];
  historyTransactions: TransactionContent[] = [];
  slides:BannerDto[] = []
  currentIndex = 0;
  intervalId: any;
  transactionFilterForm: FormGroup = new FormGroup({
    startDate: new FormControl<string | null>(null),
    endDate: new FormControl<string | null>(null),
    transactionMode: new FormControl<string | null>(null),
    status: new FormControl<string | null>(null),
    isSaved: new FormControl<boolean>(false)
  })
  templateFilterForm: FormGroup = new FormGroup({
    startDate: new FormControl<string | null>(null),
    endDate: new FormControl<string | null>(null),
    transactionMode: new FormControl<string | null>(null),
    status: new FormControl<string | null>(null),
    isSaved: new FormControl<boolean>(true)
  })

  constructor(
    private cf: ChangeDetectorRef,
    private _accountsPaymentsService: AccountsPaymentsService,
    private ngZone: NgZone,
    private accountService: AccountService,
  ) {
  }


  ngOnInit() {
    this.getAccounts()
    this.getTransactionListHistory()
    this.getBanner()
    this.autoSlide();
    this.getTemplateList()
  }

  getTransactionListHistory() {
    this.isLoading = true
    this.transactionsList = []
    this.historyTransactions = []
    this._accountsPaymentsService.getTransactionList({
      page: 0,
      size: 5
    }, this.transactionFilterForm.value).pipe(takeUntil(this.unsub$)).subscribe((res) => {
      if (!res) return
      this.transactionsList = res.content.filter(res => !res.isSigned)
      this.historyTransactions = res.content
      this.isLoading = false
      this.cf.markForCheck()
    })
  }
  getTemplateList() {
    this.isLoading = true
    this.templateList =[]
    this._accountsPaymentsService.getTransactionList({
      page: 0,
      size: 5,
    }, this.templateFilterForm.value).pipe(takeUntil(this.unsub$)).subscribe((res) => {
      if (!res) return
      this.templateList = res.content
      this.isLoading = false
      this.cf.markForCheck()
    })
  }

  getAccounts() {
    this.isLoadingAccount = true
    this.accounts = []
    this.accountService.getAccountList({page: 0, size: 5}, {}).pipe(takeUntil(this.unsub$)).subscribe(res => {
      if (!res) return
      this.accounts = res.content
      this.isLoadingAccount = false
      this.cf.markForCheck()
    })
  }

  getFormattedAccount(account: string) {
   if (account){
     const start = account.slice(0, 4);
     const end = account.slice(-4);
     return `${start}****${end}`
   }
   else {
     return account
   }
  }
  getBanner(){
    this._accountsPaymentsService.getBanners().pipe(takeUntil(this.unsub$)).subscribe((res)=>{
      if (!res) return
      this.slides = res.content
      this.cf.detectChanges()
    })
  }
  autoSlide() {
    this.ngZone.runOutsideAngular(() => {
      this.intervalId = setInterval(() => {
        this.ngZone.run(() => {
          this.nextSlide();
        });
      }, 3000); // Change slide every 3 seconds
    });
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
    this.cf.detectChanges()
  }

  selectSlide(index: number) {
    this.currentIndex = index;
    clearInterval(this.intervalId); // Stop auto-slide on manual selection
    this.autoSlide(); //
  }
  ngOnDestroy() {
    this.unsub$.next()
    this.unsub$.complete()
    clearInterval(this.intervalId);
  }

  protected readonly Math = Math;
}
