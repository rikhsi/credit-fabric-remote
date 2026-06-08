import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {  DestroyRef, inject, Injectable, signal } from "@angular/core";


import { KartotekaService } from "../services/kartoteka.service";
import {  EPTFilterRequest } from "../models/kartoteka.model";
import { TransactionContent } from "../models/kartoteka.model"
import { DEFAULT_PAGE_SIZE } from "src/app/constants";




@Injectable({ providedIn: 'root' })




export class BaseEPTStore {

    private readonly service = inject(KartotekaService);
    private readonly destroyRef = inject(DestroyRef);

    // ETP Dinamic LIST

    content = signal<TransactionContent[]>([]);
    payload = signal<EPTFilterRequest | null>(null);
    loading = signal<boolean>(false)
    activeEPTsCount = signal(0)
    pageSize = signal(DEFAULT_PAGE_SIZE)
    pageNumber = signal(0)
    totalItems = signal(0)
    totalPages = signal(0)





    loadEPTList(payload?: EPTFilterRequest) {
        this.payload.set(payload ?? null)
        this.loading.set(true);

        this.service.getEPTList(payload)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (res) => {
                    this.content.set(res?.content ?? []);
                    this.activeEPTsCount.set(this.content().length)
                    if (res?.paging) {
                        this.pageSize.set(res.paging.pageSize),
                            this.pageNumber.set(res.paging.pageNumber),
                            this.totalItems.set(res.paging.totalItems),
                            this.totalPages.set(res.paging.totalPages)
                    }
                    this.loading.set(false);
                },
                error: (err) => {
                    this.loading.set(false);
                    console.error(err);
                }
            });
    }
}


