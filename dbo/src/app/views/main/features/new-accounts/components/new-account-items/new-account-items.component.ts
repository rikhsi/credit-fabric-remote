import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject, Input,
  input,
  signal,
  ChangeDetectorRef,
  SimpleChanges, Output, EventEmitter, OnInit
} from '@angular/core';
import { AccountsDto } from "../../../accounts-payments/models/accounts-payments.model";
import { NgxMaskPipe } from "ngx-mask";
import { NgIf } from "@angular/common";
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";
import { MatIconButton } from "@angular/material/button";
import { Router, RouterLink } from "@angular/router";
import { AccountStore } from "../../../../../../store/account.store";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SvgIconComponent } from 'src/app/shared/components/svg-icon/svg-icon.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {UserService} from "../../../../../../core/services/user.service";
import {MatTooltip} from "@angular/material/tooltip";
import { HighlightDirective } from 'src/app/shared/directives/high-light.directive';

@Component({
  selector: 'app-new-account-items',
  imports: [
    NgxMaskPipe,
    NgIf,
    MatMenuTrigger,
    MatMenu,
    SvgIconComponent,
    TranslateModule,
    MatTooltip,
    HighlightDirective
  ],
  templateUrl: './new-account-items.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewAccountItemsComponent implements OnInit {
  private globalHideBalanceSignal = signal(false);
  @Input()
  set globalHideBalance(v: boolean) {
    this.globalHideBalanceSignal.set(v);
  }
  get globalHideBalance(): boolean {
    return this.globalHideBalanceSignal();
  }
  searchText  = input('');
  @Input() refreshTrigger: number = 0;
  accounts = input<AccountsDto>()
  @Output() requisite = new EventEmitter<{ altAcctId: string | undefined; id: number | undefined }>();
  @Output() onPinClickAccount = new EventEmitter<AccountsDto>();

  readonly store = inject(AccountStore);
  private readonly snackBar = inject(MatSnackBar)
  public userService = inject(UserService)
  private readonly cdr = inject(ChangeDetectorRef);


  hiddenAccountIdItems = signal<string[]>([]);
  showAccountIds = signal<string[]>([]);

  constructor(
    private cf: ChangeDetectorRef,
    private router: Router,
    private translateService: TranslateService
  ) {
    effect(() => {
      this.loadShowAccountIdsFromStorage();
    });
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['refreshTrigger']) {
      this.loadShowAccountIdsFromStorage();
    }
  }

  // navigateToStatements() {
  //   this.router.navigate(['/charts/create-statement'], {
  //     queryParams: {
  //       'type': 'account_activities',
  //       "account": this.accounts()!.altAcctId
  //     }
  //   })
  // }

    navigateToStatements() {
    this.router.navigate(['/reports/create'], {
      queryParams: {
        'template_id': 'account-activity',
        "account": this.accounts()!.altAcctId
      }
    })
  }

   get blockedTooltip(): string {
    const reason =  this.getBlockedReason({accBlockReason:this.accounts()?.accBlockReason, accBlockDetails:this.accounts()?.accBlockDetails}) 
    const dateLabel = this.translateService.instant('myAccounts.block_date', { date: this.accounts()?.accBlockDate });
    return reason ? `${reason}\n${dateLabel}` : dateLabel;
  }

  
  private getBlockedReason(info: {
    accBlockReason?: string | null;
    accBlockDetails?: string | null;
  }): string {

    if (info.accBlockReason?.trim()) {
      return info.accBlockReason;
    }

    if (info.accBlockDetails?.trim()) {
      return info.accBlockDetails;
    }
    return '';
  }



  blockAccount() {

  }

  loadShowAccountIdsFromStorage(): void {

    if (typeof window === 'undefined') return;

    const showIds = localStorage.getItem('showAccountIds');
    if (showIds) {
      try {
        const parsed = JSON.parse(showIds);
        if (parsed && Array.isArray(parsed)) {
          this.showAccountIds.set(parsed);
        } else {
          this.showAccountIds.set([]);
        }
      } catch (error) {
        console.error('Error parsing showAccountIds:', error);
      }
    } else {
      this.showAccountIds.set([]);
    }


    const hiddenIds = localStorage.getItem('hiddenAccountIds');
    if (hiddenIds) {
      try {
        const parsed = JSON.parse(hiddenIds);
        if (parsed && Array.isArray(parsed)) {
          this.hiddenAccountIdItems.set(parsed);
        } else {
          this.hiddenAccountIdItems.set([]);
        }
      } catch (error) {
        console.error('Error parsing showAccountIds:', error);
      }
    } else {
      this.hiddenAccountIdItems.set([]);
    }
    this.cf.markForCheck();
  }

  onPinClick(event: MouseEvent) {
    event.stopPropagation();
    // this.store.togglePin(this.accounts(), 'account');
    this.onPinClickAccount.emit(this.accounts())
  }

  integerPart(balance): string {
    const amount = (balance ?? 0) / 100;
    const [int] = amount.toFixed(2).split('.');
    return Number(int).toLocaleString().replace(/,/g, ' ');
  }

  decimalPart(balance): string {
    const amount = (balance ?? 0) / 100;
    const [, dec] = amount.toFixed(2).split('.');
    return dec;
  }

  copyAcctId(event: MouseEvent) {
    event.stopPropagation();
    const acctId = this.accounts()?.altAcctId;
    if (acctId) {
      navigator.clipboard.writeText(acctId).then(() => {
        this.snackBar.open(this.translateService.instant('messages.COPIED') + '✅', this.translateService.instant('global.close'), { duration: 3000 });
      }).catch(() => {
        this.snackBar.open(this.translateService.instant('messages.ERROR_WITH_COPY'), this.translateService.instant('global.close'), { duration: 3000 });
      });
    }
  }

  createPayment() {
    this.router.navigate(['/payment/transfer-to-account'], {
      queryParams: {
        'account': encodeURIComponent(JSON.stringify(this.accounts()))
      }
    })
  }


  navigateAccount() {
    // if (this.accounts()?.status !== 'BLOCKED') {
      this.router.navigate(['accounts/account', this.accounts()?.altAcctId], {
        queryParams: {
          'data': encodeURIComponent(JSON.stringify(this.accounts()))
        }
      })
    // }
  }

  toggleAccountVisibility(event: MouseEvent, id: string = ''): void {
    event.stopPropagation();

    const acctId = id.trim();
    if (!acctId) return;

    this.syncHiddenAccountIdsFromStorage();
    if (this.globalHideBalanceSignal()) {
      this.loadShowAccountIdsFromStorage()
      const currentShow = this.showAccountIds();
      const isShow = currentShow.includes(acctId);
      const updatedShow = isShow
        ? currentShow.filter(item => item !== acctId)
        : [...currentShow, acctId];

      this.showAccountIds.set(updatedShow);
      localStorage.setItem('showAccountIds', JSON.stringify(updatedShow));
      // this.cf.markForCheck();
    } else {
      const currentHidden = this.hiddenAccountIdItems();
      const isHidden = currentHidden.includes(acctId);

      const updatedHidden = isHidden
        ? currentHidden.filter(item => item !== acctId)
        : [...currentHidden, acctId];

      this.hiddenAccountIdItems.set(updatedHidden);
      localStorage.setItem('hiddenAccountIds', JSON.stringify(updatedHidden));
      // this.cf.markForCheck();
    }

  }

  isHidden(acctId = '') {
    if (this.globalHideBalanceSignal()) {
      if (this.globalHideBalanceSignal() && this.showAccountIds()?.length) {
        return acctId && this.showAccountIds()?.length ? !this.showAccountIds().includes(acctId) : false;
      }
      return true;
    } else {
      const acctId = this.accounts()?.altAcctId ?? '';
      return acctId && this.hiddenAccountIdItems()?.length ? this.hiddenAccountIdItems().includes(acctId) : false;
    }

  };

  private syncHiddenAccountIdsFromStorage(): void {
    try {
      const saved = localStorage.getItem('hiddenAccountIds');
      const parsed = saved ? JSON.parse(saved) : [];

      this.hiddenAccountIdItems.set(Array.isArray(parsed) ? parsed : []);
    } catch (error) {
      this.hiddenAccountIdItems.set([]);
    }
  }

  protected readonly Math = Math;
}
