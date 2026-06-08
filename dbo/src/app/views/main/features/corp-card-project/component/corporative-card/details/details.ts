
import { NgxMaskPipe } from "ngx-mask";
import { ChangeDetectorRef, Component, computed, inject, OnInit, signal } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { MatDialog } from "@angular/material/dialog";

// Store
import { CardStore } from "src/app/store/card.store";


// Components
import { CorpCardHistoryComponent } from "../../corporative-card-history/corp-card-history";
import { CorpCardInfoRequsite } from "../../dialogs/card-requisite/requisite";
import { BlockCardDialogComponent } from "../../dialogs/block-card/block-card";
import { LimitDialogComponent } from "../../dialogs/limit/list/limit-list";
import { CorpCardService } from "../../../services/corp-card.service";

import { TranslateModule } from "@ngx-translate/core";
import { formatExpireDate } from "src/app/core/utils/global-filter.util";
import { CorpCardTransactionHistoryStore } from "../../../store/transactions-history.store";
import { getSelectedData } from "src/app/core/utils/form-filter.util";
import { detailBankCards, detailStatuses } from "../../../constants/corp-card-constants";
import { CorpCardLimitStore } from "../../../store/limit.store";
import { LimitInfo } from "../../../model/limit.model";
import {UserService} from "../../../../../../../core/services/user.service";
import {MatTooltip} from "@angular/material/tooltip";
import { AccountCardComponent, AccountCardData } from "src/app/shared/components/account-card/account-card.component";


type CardId = string;


@Component({
  selector: 'corp-card-detail',
  imports: [CommonModule, CorpCardHistoryComponent, RouterLink, NgxMaskPipe, NgOptimizedImage,AccountCardComponent, TranslateModule, MatTooltip],
  templateUrl: './details.html',
})


export class DetailComponent implements OnInit {
  private cf = inject(ChangeDetectorRef);
  constructor(
    private route: ActivatedRoute,
  ) { }

  protected readonly router = inject(Router)
  readonly cardStore = inject(CardStore)
  readonly dialog = inject(MatDialog)
  protected transactionHistoryStore = inject(CorpCardTransactionHistoryStore)
  protected corpCardService = inject(CorpCardService)
  protected corpCardLimitStore = inject(CorpCardLimitStore);
  public userService = inject(UserService)
  protected cardId = "";
  protected credit: number = 0;
  protected debit: number = 0;
  protected account: string | null = null


  globalHideBalanceSignal = signal(false);
  hiddenCardIdItems = signal<string[]>([]);
  showCardIds = signal<string[]>([]);

   limitInfo = signal<LimitInfo | null>(null);
   limitHistory = signal<LimitInfo[]>([])


corpCard = computed<AccountCardData>(() => {
  const card = this.cardStore.cards()[0];

  if (!card) {
    return {
      balance: '0',
      decimals: '00',
      currency: 'UZS',
      statusLabel: '',
      statusIcon: '',
      isActive: false,
      accountType: '',
      maskedNumber: '',
      flagSrc: 'assets/flags/radius-20/UZS.png',
    };
  }

  const rawAmount = Number(card.balance?.amount) / 100;
  const [intPart, decPart = '00'] = rawAmount.toFixed(2).split('.');
  const balance = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  // **** 9499 • 05/29 • 1111
  const last4 = card.pan?.slice(-4) ?? '';
  const expiry = card.expiryDate
    ? `${card.expiryDate.slice(0, 2)}/${card.expiryDate.slice(2, 4)}`
    : '';
  const contract = card.contractNumber ?? '';
  // const maskedNumber = `**** ${last4} • ${expiry} • ${contract}`;

  return {
    balance,
    decimals: decPart,
    currency: card.balance?.currency ?? '',
    statusLabel: card.statusName,
    isActive: card.status === 'ACTIVE',
    isNotActiveAccount: card.status != 'ACTIVE',
    accountType: card.title || card.type || '',
    maskedNumber:`**** ${last4}`,
    expiryDate:expiry,
    isBlocked:card.status == 'BLOCKED',
    blockedTextTranslateKey:"new_loan.card_blocked",
    blockedDate:card?.accBlockDate ||'',
    blockedReason:card?.accBlockReason ||'',
    flagSrc: this.getBankCard() ?? '',
    statusIcon: this.handleStatusIcon(card.status)
  };
});

  protected  isBlocked = signal(false)



    ngOnInit() {
    this.loadVisibilityState();
     this.cardId = this.route.snapshot.paramMap.get('id')!;
    if (this.cardId) {
      this.cardStore.loadCards({ cardUuid: this.cardId });
      this.corpCardLimitStore.loadLimitInfo({ id: this.cardId });
      this.corpCardLimitStore.loadLimitHistory({ id: this.cardId });
      this.routerListener()
    }
  }



  private handleStatusIcon(status:string):string {
      if(status == 'ACTIVE') {
        return 'assets/new-icons/bank-cards/tick.svg';
      }else if(status == 'BLOCKED') {
        return 'assets/new-icons/blocked-icon.svg';
      }else if(status =='EXPIRED') {
        return 'assets/new-icons/bank-cards/exclamation.svg';
      }
      return ''
  }

  routerListener(): void {

    this.route.queryParams.subscribe(params => {
      const dialogAction = params['dialogAction'];
      const type = params['type'];
      if (dialogAction === 'on' && type === 'limit') {
        console.log('dialogAction000', dialogAction);
        this.clearUrl()
        this.onMenuOpened()
      } });
  }
  clearUrl() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { dialogAction: null, type: null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }
  protected fromAccountToCard() {
    this.router.navigate(['/payment/transfer-to-corporate-card'], {
      queryParams: {
        cardId: this.cardId,
        type: "fromCorpCard",
        mode: 'CR'
      }
    });
  }

  protected fromCardToAcccount() {
    this.router.navigate(['/payment/transfer-to-corporate-card'], {
      queryParams: {
        cardId: this.cardId,
        type: "fromCorpCard",
        mode: 'DR'
      }
    });
  }

  // Send to create (Выписка)
  protected createStatement() {
    // this.router.navigate(['/charts/create-statement'], {
    //   queryParams: {
    //     account: this.cardStore.cards()[0].account ?? "22620000904694350006",
    //     type: "account_activities"
    //   }
    // });
    this.router.navigate(['reports/create'], {
      queryParams: {
        'template_id': 'account-activity',
        'account': this.cardStore.cards()[0].account ?? ""
      }
    })
  }

  // Open Card Requisites  (Pеквизиты)
  protected openCardRequisites(card: any): void {
    if (!card) return;
    this.dialog.open(CorpCardInfoRequsite, {
      data: card,
      width: '475px',
      height: 'calc(100% - 16px)',
      position: { right: '0' },
      panelClass: 'right-side-dialog',
    });
  }

  // Create limit  (Лимиты)

  protected onMenuOpened(): void {
    this.corpCardService.getLimitInfo({ id: this.cardId }).subscribe({
    next: (res) => {
      this.corpCardService.getLimitHistory({ id: this.cardId });
      this.openLimitInfoDialog(res);
    },
    error: (err) => console.error('Error loading limit info', err)
  });
  }

  protected openLimitInfoDialog(limitInfo:LimitInfo | null): void {
   this.dialog.open(LimitDialogComponent, {
      data: {
        cardId: this.cardId,
        info: limitInfo,
        histories: this.corpCardLimitStore.limitHistory(),
        hasLimit: limitInfo?.isActive
      },
      width: '517px',
      height: 'calc(100% - 16px)',
      position: { right: '0' },
      panelClass: 'right-side-dialog',
    });
  }

  // Open Card Block Dialog  (Заблокировать)
  protected openCardBlockDialog(card: any,): void {
    if (!card) return
    const dialogRef = this.dialog.open(BlockCardDialogComponent, {
      data: card,
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == "success") {
        this.cardStore.loadCards({ cardUuid: this.cardId });
      }
    });
  }

  // Helpers
  protected get formattedExpireDate(): string {
    if (!this.cardStore.cards()[0]?.expiryDate) return '--/--';

    const raw = this.cardStore.cards()[0]?.expiryDate.toString().trim();


    if (!raw) return ""

    if (/^\d{4}$/.test(raw)) {
      return `${raw.slice(0, 2)}/${raw.slice(2, 4)}`;
    }
    return raw;
  }

  protected get cardStatusIcon(): string {
    const type = this.cardStore.cards()[0]?.status?.toUpperCase();
    if (type == 'ACTIVE') {
      return "assets/new-icons/bank-cards/status-detail.svg"
    } else if (type == 'BLOCKED') {
      return "assets/new-icons/blocked-icon.svg";
    } else {
      return ''
    }
  }

  protected getStatus() {
    return getSelectedData(this.cardStore.cards()[0]?.status?.toUpperCase(), this.statusList, 'type')?.img || '';
  }

  protected getBankCard() {
    return getSelectedData(this.cardStore.cards()[0]?.type?.toUpperCase(), this.detailBankCards, 'type')?.img || '';
  }

  protected toggleAccountVisibility(event: MouseEvent, cardId: CardId = ''): void {
    event.stopPropagation();
    const id = cardId.trim();
    if (!id) return;

    this.syncHiddenCardIdsFromStorage();

    if (this.globalHideBalanceSignal()) {
      this.toggleItemInStorage(id, 'showCorpCardIds', this.showCardIds);
    } else {
      this.toggleItemInStorage(id, 'hiddenCorpCardIds', this.hiddenCardIdItems);
    }
  }

  protected isHidden(cardId: CardId = ''): boolean {
    if (this.globalHideBalanceSignal()) {
      const showIds = this.showCardIds();
      return showIds.length ? !showIds.includes(cardId) : true;
    }

    const hiddenIds = this.hiddenCardIdItems();
    return hiddenIds.includes(cardId);
  }

  private syncHiddenCardIdsFromStorage(): void {
    const hiddenIds = this.getStoredArray('hiddenCorpCardIds');
    this.hiddenCardIdItems.set(hiddenIds);
  }

  protected loadVisibilityState(): void {
    this.showCardIds.set(this.getStoredArray('showCorpCardIds'));
    this.hiddenCardIdItems.set(this.getStoredArray('hiddenCorpCardIds'));
    this.cf.markForCheck();
  }

  private toggleItemInStorage(id: CardId, key: string, signalRef: any): void {
    const current = signalRef() as CardId[];
    const exists = current.includes(id);
    const updated = exists ? current.filter(i => i !== id) : [...current, id];
    signalRef.set(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  }

  private getStoredArray(key: string): CardId[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn(`Error parsing ${key}:`, error);
      return [];
    }
  }


  protected readonly Math = Math;
  protected readonly Number = Number;
  protected statusList = detailStatuses;
  protected detailBankCards = detailBankCards;
  protected formatExpireDate = formatExpireDate
}
