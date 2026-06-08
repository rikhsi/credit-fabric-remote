import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { computed, DestroyRef, inject, Injectable, signal } from "@angular/core";


import { KartotekaService } from "../services/kartoteka.service";
import { TotalBalance, KartotekaContent, KartotekaRequest, KartotekaOne } from "../models/kartoteka.model";
import { DEFAULT_PAGE_SIZE } from "src/app/constants";



@Injectable({ providedIn: 'root' })


export class BaseKartotekaStore {

    private readonly service = inject(KartotekaService);
    private readonly destroyRef = inject(DestroyRef);

    // KARTOTEKA Dinamic LIST

    content = signal<KartotekaContent[]>([]);
    payload = signal<KartotekaRequest | null>(null);
    loading = signal<boolean>(false)
    activeCardsCount = signal(0)
    pageSize = signal(DEFAULT_PAGE_SIZE)
    pageNumber = signal(0)
    totalItems = signal(0)
    totalPages = signal(0)


    balance = signal<TotalBalance>({
        amount: 0,
        currency: "UZS",
        scale: 2
    });


    // FUNCTOINS
    completed = computed(() => this.content().filter(data => data.status === 'DELETED'));
    active = computed(() => this.content().filter(data => data.status === 'ACTIVE' || data.status === 'PARTIAL_CLOSED'));


    loadKartotekaList(payload?: KartotekaRequest) {
        this.payload.set(payload ?? null)
        this.loading.set(true);
        this.service.getKartotekaList(payload)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (res) => {
                    this.content.set(res?.content ?? []);
                    this.activeCardsCount.set(this.content().length)
                    if (res?.paging) {
                        this.pageSize.set(res.paging.pageSize),
                            this.pageNumber.set(res.paging.pageNumber),
                            this.totalItems.set(res.paging.totalItems),
                            this.totalPages.set(res.paging.totalPages)
                    }
                    if (res?.total) {
                        this.balance.set(res.total)
                    }
                    this.loading.set(false);
                },
                error: (err) => {
                    this.loading.set(false);
                    console.error(err);
                }
            });
    }


    //    RECIEPENT LIST

    recipentLoading = signal<boolean>(false)
    recipentList = signal<string[]>([])

    loadRecipients(search?: string | null, recipientType?: string | null) {
        this.recipentLoading.set(true)
        this.recipentList.set([])
        const params =  { coName: search || '', recipientType: recipientType || '' }
        this.service.getRecipientList(params)
            .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
                next: (res) => {
                    this.recipentList.set(res?.coNameList ?? [])
                    this.recipentLoading.set(false);
                },
                error: (err) => {
                    this.recipentLoading.set(false);
                    console.error(err);
                }
            })
    }


    // KARTOTEKA ONE


    isKartotekaLoading = signal<boolean>(false)
    kartotekaData = signal<KartotekaOne | null>(null)

    getKartotkekaOne(documentId: number) {
        if (!documentId) return
        this.isKartotekaLoading.set(true)
        this.kartotekaData.set(null)

        this.service.getKartotekaById(documentId)
            .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
                next: (res) => {
                    this.kartotekaData.set(res)
                    this.isKartotekaLoading.set(false);
                },
                error: (err) => {
                    this.isKartotekaLoading.set(false);
                    console.error(err);
                }
            })
    }

}


