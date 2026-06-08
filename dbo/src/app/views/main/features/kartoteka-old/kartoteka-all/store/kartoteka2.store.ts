// // Angular
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { computed, DestroyRef, inject, Injectable, signal } from "@angular/core";

// // Service
import { Kartoteka2Service } from "../services/kartoteka2.service";

// odel
import { TotalBalance, Kartoteka2Content, Kartoteka2Request, STATUSES } from "../models/kartoteka2.model";
import { DEFAULT_PAGE_SIZE } from "src/app/constants";




@Injectable({ providedIn: 'root' })

export class Kartoteka2Store {
    private readonly service = inject(Kartoteka2Service);
    private readonly destroyRef = inject(DestroyRef);

    // KARTOTEKA 2 LIST
    
    content = signal<Kartoteka2Content[]>([]);
    payload = signal<Kartoteka2Request | null>(null);
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

    loadKartoteka2List(payload?: Kartoteka2Request) {
        this.payload.set(payload ?? null)
        this.loading.set(true);
        this.service.getKartoteka2List(payload)
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

    loadRecipients(search?: string | null) {
        this.recipentLoading.set(true)
        this.recipentList.set([])
        const params = search ? { coName: search } : {}
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


    // STATUS 

    statusListToMap = signal<{ name: string; value: string; img: string }[]>([]);

    loadStatuses() {
     this.service.getStatusList().subscribe({
       next: (res) => {
         if (res?.statusList) {
           const list = res.statusList;
           const result  = Object.entries(list)
             .filter(([key]) => key !== STATUSES.UNKNOWN)
             .map(([key, value]) => ({
               value: key,
               name: value,
               img: this.getStatusIcon(key as STATUSES),
             }));
             this.statusListToMap.set(result)
         }
       },
     });
   }
 
   private getStatusIcon(status: STATUSES): string {
     switch (status) {
       case STATUSES.ACTIVE:
         return './assets/new-icons/planned-status.svg';
       case STATUSES.PARTIAL_CLOSED:
         return './assets/new-icons/partially-status.svg';
       case STATUSES.DELETED:
         return './assets/new-icons/enrolled-status.svg';
       default:
         return '';
     }
   }
}
