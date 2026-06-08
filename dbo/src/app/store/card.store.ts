import { computed, DestroyRef, inject, Injectable, signal, WritableSignal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";


import { MatSnackBar } from "@angular/material/snack-bar";
import { PayrollProjectResponseContent } from "../views/main/features/payroll-project/models/payroll-project.type";
import { Balance } from "../core/models/backend-response.model";
import { CorpCardService } from "../views/main/features/corp-card-project/services/corp-card.service";
import { CardTotalBalanceRequest } from "../views/main/features/corp-card-project/model/shared-card.model";
import { DEFAULT_PAGE_SIZE } from "../constants";


@Injectable({ providedIn: 'root' })

export class CardStore {
    private readonly cardService = inject(CorpCardService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly snackBar = inject(MatSnackBar);

    readonly balance: WritableSignal<Balance | null> = signal(null);
    cards = signal<PayrollProjectResponseContent[]>([]);
    pageIndex = signal<number>(0)
    pageSize = signal<number>(DEFAULT_PAGE_SIZE)
    totalItems = signal<number>(0)
    cardsLoading = signal<boolean>(false)

    isBlocked= computed(() => {
      if(this.cards().length) {
        return this.cards()[0].status == "BLOCKED";
      }
      return false;
    })

    readonly pinnedCards = computed(() => this.cards().filter(acc => acc.hasPinned));
    readonly unPinnedCards = computed(() => this.cards().filter(acc => !acc.hasPinned));

    readonly sumCards = computed(() => this.cards().filter(card => card.balance?.currency === 'UZS'));
    readonly exchangeCards = computed(() => this.cards().filter(card => card.balance?.currency !== 'UZS'));



    loadCards(payload?: CardTotalBalanceRequest) {
        this.cardsLoading.set(true);
        this.cards.set([]);
        if(payload?.type== "ALL"){
           payload.type= undefined
        }
        const params = {
            ...payload,
            userType: "CORPORATE"
        };

        this.cardService.getAllPayrollProjectList(params)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (res) => {
                    this.cards.set(res?.content ?? []);
                    console.log(111,res?.content);
                    this.pageSize.set(res?.pageable.pageSize || 0);
                    this.pageIndex.set(res?.pageable?.pageNumber || 0);
                    this.totalItems.set(res?.totalElements || 0);
                    this.cardsLoading.set(false);
                },
                error: (err) => {
                    this.cardsLoading.set(false);
                    console.error(err);
                }
            });
    }


    getCardsBalance(currency?: string) {
        this.cardService
            .getCardsTotalBalance({ updateBalance: true, type: "UZCARD", status: "ACTIVE",  userType: "CORPORATE" , currency: currency ?? "" })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (res) => {
                    const hasBalance = res && res.totalAmount.amount !== undefined && res.totalAmount.currency;
                    if (hasBalance) {
                        this.balance.set({ amount: res?.totalAmount?.amount, scale: res?.totalAmount.scale ?? 2, currency: res?.totalAmount.currency ?? currency});
                    } else {
                        this.balance.set({amount: 0, scale: 2, currency: currency ?? "UZS"})
                    }
                }
            });
    }


    togglePin(item: PayrollProjectResponseContent) {
        const isPinned = item.hasPinned;
        if (isPinned) {
            this.cardService.unpinCard(item.uuid)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                    next: () => this.loadCards(),
                    error: () => this.showError('Не удалось открепить карту')
                });
        } else {
            if (this.pinnedCards().length >= 4) {
                this.showError('Можно закрепить не более 4 карт');
                return;
            }
            this.cardService.createPinCard(item.uuid)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                    next: () => this.loadCards(),
                    error: () => this.showError('Не удалось закрепить карту')
                });
        }
    }


    private showError(message: string) {
        this.snackBar.open(message, 'Закрыть', { duration: 3000 });
    }
}
