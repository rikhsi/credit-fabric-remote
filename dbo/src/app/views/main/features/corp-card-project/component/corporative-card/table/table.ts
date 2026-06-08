// Angular
import { NgxMaskPipe } from "ngx-mask";
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router, RouterLink } from "@angular/router";
import { NgIf, NgOptimizedImage, NgClass } from "@angular/common";
import { MatDialog } from '@angular/material/dialog';
import { MatMenu, MatMenuTrigger } from "@angular/material/menu";
import { ChangeDetectionStrategy, Component, effect, inject, Input, input, signal, ChangeDetectorRef, SimpleChanges, Output, EventEmitter, output } from '@angular/core';


// Component
import { LimitDialogComponent } from "../../dialogs/limit/list/limit-list";
import { BlockCardDialogComponent } from '../../dialogs/block-card/block-card';
import { CorpCardInfoRequsite } from "../../dialogs/card-requisite/requisite";

// Store
import { CardStore } from "src/app/store/card.store";
import { CorpCardLimitStore } from "../../../store/limit.store";
import { CorpCardService } from "../../../services/corp-card.service";

// Model
import { bankCards, detailStatuses } from "../../../constants/corp-card-constants";
import { PayrollProjectResponseContent } from "../../../../payroll-project/models/payroll-project.type";


// Utils
import { getSelectedData } from "src/app/core/utils/form-filter.util";
import { formatExpireDate, maskNumber } from "src/app/core/utils/global-filter.util";
import {UserService} from "../../../../../../../core/services/user.service";
import {MatTooltip} from "@angular/material/tooltip";
import { maskNumberShort } from "src/app/core/utils/mask.utils";


@Component({
  selector: 'CardTable',
  imports: [
    NgxMaskPipe,
    NgIf,
    NgClass,
    MatMenuTrigger,
    MatMenu,
    RouterLink,
    NgOptimizedImage,
    TranslateModule,
    MatTooltip
  ],
  templateUrl: './table.html',
  styles:`
  .mask-dots {
  font-size: 14px;
  line-height: 1;
  vertical-align: middle;
}
`,
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class TableComponent {
  private cf = inject(ChangeDetectorRef);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  protected readonly cardStore = inject(CardStore)
  public userService = inject(UserService)
  protected corpCardService = inject(CorpCardService)
  protected readonly corpCardLimitStore = inject(CorpCardLimitStore);
  private translateService = inject(TranslateService)


  constructor() {
    effect(() => {
      this.loadShowCardsIdFromStorage();
    });
  }


  cards = input<PayrollProjectResponseContent>()
  @Input() refreshTrigger: number = 0;
  @Input() set globalHideBalance(v: boolean) {
    this.globalHideBalanceSignal.set(v);
  }

  changeTitle = output<{ title: any, uuid: any }>()
  @Output() onPinClickCard = new EventEmitter<PayrollProjectResponseContent>();
  @Output() refreshCards = new EventEmitter<void>();


  globalHideBalanceSignal = signal(false);
  hiddenCardIdItems = signal<string[]>([]);
  showCardIds = signal<string[]>([]);

  get globalHideBalance(): boolean {
    return this.globalHideBalanceSignal();
  }




  ngOnChanges(changes: SimpleChanges): void {
    if (changes['refreshTrigger']) {
      this.loadShowCardsIdFromStorage();
    }

  }

 get blockedTooltip(): string {
  const card = this.cards();
  const reason = card?.accBlockDetails;

  if (!reason) return '';

  const dateLabel = card?.accBlockDate
    ? this.translateService.instant('myAccounts.block_date', { date: card.accBlockDate })
    : '';

    console.log('bingo')
  return dateLabel ? `${reason}\n${dateLabel}` : reason;
}

  createStatement() {
    this.router.navigate(['reports/create'], {
      queryParams: {
        'template_id': 'account-activity',
        'account': this.cards()?.account || null
      }
    })
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


  protected navigateToDetails() {
    this.router.navigate([`corp-card-project/corp-card-details/${this.cards()?.uuid}`])
  }

  protected onPinClick(event: MouseEvent) {
    event.stopPropagation();
    this.onPinClickCard.emit(this.cards())
  }

  protected toggleAccountVisibility(event: MouseEvent, id: string = ''): void {
    event.stopPropagation();

    const cardId = id.trim();
    if (!cardId) return;
    this.syncHiddenCardIdsFromStorage();
    if (this.globalHideBalanceSignal()) {
      this.loadShowCardsIdFromStorage()
      const currentShow = this.showCardIds();
      const isShow = currentShow.includes(cardId);
      const updatedShow = isShow ? currentShow.filter(item => item !== cardId) : [...currentShow, cardId];
      this.showCardIds.set(updatedShow);
      localStorage.setItem('showCorpCardIds', JSON.stringify(updatedShow));
    } else {
      const currentHidden = this.hiddenCardIdItems();
      const isHidden = currentHidden.includes(cardId);
      const updatedHidden = isHidden ? currentHidden.filter(item => item !== cardId) : [...currentHidden, cardId];
      this.hiddenCardIdItems.set(updatedHidden);
      localStorage.setItem('hiddenCorpCardIds', JSON.stringify(updatedHidden));
    }

  }

  protected isHidden(cardId = '') {
    if (this.globalHideBalanceSignal()) {
      if (this.globalHideBalanceSignal() && this.showCardIds()?.length) {
        return cardId && this.showCardIds()?.length ? !this.showCardIds().includes(cardId) : false;
      }
      return true;
    } else {
      const cardId = this.cards()?.uuid ?? '';
      return cardId && this.hiddenCardIdItems()?.length ? this.hiddenCardIdItems().includes(cardId) : false;
    }

  };

  private syncHiddenCardIdsFromStorage(): void {
    try {
      const saved = localStorage.getItem('hiddenCorpCardIds');
      const parsed = saved ? JSON.parse(saved) : [];

      this.hiddenCardIdItems.set(Array.isArray(parsed) ? parsed : []);
    } catch (error) {
      this.hiddenCardIdItems.set([]);
    }
  }

    loadShowCardsIdFromStorage(): void {
    if (typeof window === 'undefined') return;

    const showIds = localStorage.getItem('showCorpCardIds');
    if (showIds) {
      try {
        const parsed = JSON.parse(showIds);
        if (parsed && Array.isArray(parsed)) {
          this.showCardIds.set(parsed);
        } else {
          this.showCardIds.set([]);
        }
      } catch (error) {
        console.error('Error parsing showCardIds:', error);
      }
    } else {
      this.showCardIds.set([]);
    }


    const hiddenIds = localStorage.getItem('hiddenCorpCardIds');
    if (hiddenIds) {
      try {
        const parsed = JSON.parse(hiddenIds);
        if (parsed && Array.isArray(parsed)) {
          this.hiddenCardIdItems.set(parsed);
        } else {
          this.hiddenCardIdItems.set([]);
        }
      } catch (error) {
        console.error('Error parsing showCardIds:', error);
      }
    } else {
      this.hiddenCardIdItems.set([]);
    }
    this.cf.markForCheck();
  }

  protected onMenuOpened(event: any , cardId: string = ''): void {
    event.stopPropagation();
    if(!cardId) return
    this.corpCardLimitStore.loadLimitInfo({id:cardId});
    this.corpCardLimitStore.loadLimitHistory({id:cardId});
  }

  protected openLimitListDialog(): void {
    this.dialog.open(LimitDialogComponent, {
      data: {
        cardId: this.cards()?.uuid,
        info: this.corpCardLimitStore.limitInfo(),
        histories: this.corpCardLimitStore.limitHistory(),
        hasLimit: this.corpCardLimitStore.limitInfo()?.isActive
      },
      width: '517px',
      height: 'calc(100% - 16px)',
      position: { right: '0' },
      panelClass: 'right-side-dialog',
    });
  }

  protected openCardBlockDialog(card: any): void {
    if (!card) return
    const dialogRef = this.dialog.open(BlockCardDialogComponent, {
      data: card,
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == "success") {
        this.cardStore.loadCards();
      }
    });
  }

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

  protected getCardLogo(bankCard: string | undefined): string {
      if(!bankCard) return '';
      return getSelectedData(bankCard?.toUpperCase(),  this.bankCards , 'type')?.img || '';
  }

  protected getStatusLogo(status: string | undefined): string {
    if(!status) return '';
      return getSelectedData(status?.toUpperCase(),  this.statusList , 'type')?.img || '';
  }

  protected readonly Math = Math;
  protected readonly bankCards = bankCards;
  protected readonly statusList = detailStatuses
  protected formatExpireDate = formatExpireDate;
  protected maskNumber = maskNumber
  protected maskNumberShort = maskNumberShort
}
