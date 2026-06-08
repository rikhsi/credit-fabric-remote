// // Angular
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DestroyRef, inject, Injectable, signal } from "@angular/core";

// // Service
import { CorpCardService } from "../services/corp-card.service";
import { CardTransaction, TransactionFilterRequest } from "../model/transaction-history.model";
import { getGroupedCardTransactions } from "src/app/core/utils";



@Injectable({ providedIn: 'root' })

export class CorpCardTransactionHistoryStore {
    private readonly service = inject(CorpCardService);
    private readonly destroyRef = inject(DestroyRef);


    loading = signal<boolean>(false)
    errorMessage = signal("")

    content = signal<CardTransaction[]>([]);
    grouped = signal<[string, CardTransaction[]][]>([])
    signPrepareCount = signal(0)
    totalDebit = signal(0)
    totalCredit = signal(0)


    pageSize = signal(10)
    pageNumber = signal(0)
    totalItems = signal(0)
    totalPages = signal(0)


    loadTransactionsHistory(payload?: TransactionFilterRequest) {
        this.loading.set(true);
        this.errorMessage.set('');
        this.service.getTransactionHistory(payload)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (res) => {
                    const result = res?.pagingResponse.content ?? [];
                    const currentPage = res?.pagingResponse.paging?.pageNumber ?? 0;

                    if (!Array.isArray(result)) {
                        this.errorMessage.set('Unexpected response format')
                        return;
                    }

                    this.content.set(currentPage === 0 ? [...result] : [...this.content(), ...result]);
                    this.grouped.set(Object.entries(getGroupedCardTransactions(this.content())));


                    this.signPrepareCount.set(res?.signPrepareCount ?? 0);
                    this.totalDebit.set(res?.totalDebit ?? 0);
                    this.totalCredit.set(res?.totalCredit ?? 0);

                    this.pageSize.set(res?.pagingResponse.paging?.pageSize ?? 10);
                    this.pageNumber.set(res?.pagingResponse.paging?.pageNumber ?? 0);
                    this.totalItems.set(res?.pagingResponse.paging?.totalItems ?? 0);
                    this.totalPages.set(res?.pagingResponse.paging?.totalPages ?? 0);
                },
                error: (err) => {
                    console.error('Transaction history load error:', err);
                    this.errorMessage.set('Failed to load transaction history');
                },
                complete: () => this.loading.set(false)
            });
    }

}
