import {ChangeDetectionStrategy, Component, computed, DestroyRef, Inject, inject, OnInit, signal} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef} from "@angular/material/dialog";
import {AccountsDto} from "../../../accounts-payments/models/accounts-payments.model";
import {JsonPipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {NgxMaskPipe} from "ngx-mask";
import {getTranslate, maskNumberMiddle} from "../../../../../../core/utils";
import { moveItemInArray, CdkDragDrop, DragDropModule} from '@angular/cdk/drag-drop';
import {AccountStore} from "../../../../../../store/account.store";
import {MAIN_COMPONENT_PRODUCTS, TabKey} from "../../constants/new-main.const";
import {MatDivider} from "@angular/material/divider";
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatTooltip } from '@angular/material/tooltip';
import {AccountService} from "../../../../../../core/services/account.service";

@Component({
  selector: 'app-settings',
  imports: [
    MatIcon,
    MatDialogClose,
    NgIf,
    DragDropModule,
    NgxMaskPipe,
    NgForOf,
    NgClass,
    TranslateModule,
    MatTooltip
  ],
  templateUrl: './settings.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent implements OnInit {
  private translateService = inject(TranslateService)
  readonly store = inject(AccountStore);
  private readonly accountService = inject(AccountService);
  public readonly active = signal<TabKey>('accounts');
  public isChanging = signal<boolean>(false);
  isSettingActionable = signal(false)
   constructor(
    @Inject(MAT_DIALOG_DATA) public data: { active:TabKey},
    public _dialogRef: MatDialogRef<SettingsComponent>
  ) {
  }


  ngOnInit(): void {
    this.store.loadAccounts()
    this.store.loadCards()
    this.store.loadDeposits()
    this.store.loadCredits()
    if(this.data) {
      this.active.set(this.data.active)
    }
  }

  toggleSettingAction() {
    this.isSettingActionable.update(v => !v)
  }
  dropAccounts(event: CdkDragDrop<any[]>) {
    const accounts = [...this.store.pinnedAccounts()];

    moveItemInArray(
      accounts,
      event.previousIndex,
      event.currentIndex
    );

    this.store.updatePinnedAccountsOrder(accounts)

    const body = accounts.reduce((acc, item, index) => {
      acc[String(item.id)] = index;
      return acc;
    }, {} as Record<number, number>);

    this.accountService.orderAccountList(body).pipe().subscribe({
      next: result => {
        this.store.loadAccounts()
      },
      error: error => {
        console.log(error, "rrro");
      }
    })
  }

  dropCards(event: CdkDragDrop<any[]>) {
    const cards = [...this.store.pinnedCards()];

    moveItemInArray(
      cards,
      event.previousIndex,
      event.currentIndex
    );

    this.store.updatePinnedCardsOrder(cards);

    const body = cards.reduce((acc, item, index) => {
      acc[String(item.uuid)] = index;
      return acc;
    }, {} as Record<number, number>);

    this.accountService.orderCardList(body).pipe().subscribe({
      next: result => {
        this.store.loadCards();
      },
      error: error => {
        console.log(error, "rrro");
      }
    })
  }


  dropDeposits(event: CdkDragDrop<any[]>) {
    const deposits = [...this.store.pinnedDeposits()];

    moveItemInArray(
      deposits,
      event.previousIndex,
      event.currentIndex
    );

    this.store.updatePinnedDepositsOrder(deposits);

    const body = deposits.reduce((acc, item, index) => {
      acc[String(item.id)] = index;
      return acc;
    }, {} as Record<number, number>);

    this.accountService.orderDepositList(body).pipe().subscribe({
      next: result => {
        this.store.deposits();
      },
      error: error => {
        console.log(error, "rrro");
      }
    })
  }

  dropCredits(event: CdkDragDrop<any[]>) {
    const credits = [...this.store.pinnedCredits()];

    moveItemInArray(
      credits,
      event.previousIndex,
      event.currentIndex
    );

    this.store.updatePinnedCreditsOrder(credits);

    const body = credits.reduce((acc, item, index) => {
      acc[String(item.loanId)] = index;
      return acc;
    }, {} as Record<number, number>);

    this.accountService.orderCreditList(body).pipe().subscribe({
      next: result => {
        this.store.credits();
      },
      error: error => {
        console.log(error, "rrro");
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



  blockedTooltip(accounts: AccountsDto): string {
    const reason =  this.getBlockedReason({accBlockReason:accounts.accBlockReason, accBlockDetails:accounts.accBlockDetails})
    const dateLabel = this.translateService.instant('myAccounts.block_date', { date: accounts.accBlockDate });
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



  protected readonly maskNumberMiddle = maskNumberMiddle;
  protected readonly MAIN_COMPONENT_PRODUCTS = MAIN_COMPONENT_PRODUCTS;
  protected readonly getTranslate = getTranslate;
}
