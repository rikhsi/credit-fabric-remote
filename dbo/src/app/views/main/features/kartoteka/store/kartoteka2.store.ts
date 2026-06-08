// // Angular
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DestroyRef, inject, Injectable, signal } from "@angular/core";

// // Service
import { KartotekaService } from "../services/kartoteka.service";

// Model
import { IClientReservation, STATUSES , ClientReservationNeeds } from "../models/kartoteka.model";




@Injectable({ providedIn: 'root' })

export class Kartoteka2Store {
    private readonly service = inject(KartotekaService);
    private readonly destroyRef = inject(DestroyRef);

     // RESERVATION RESPONSE


    isReservationLoading = signal<boolean>(false)
    reservationContent = signal<IClientReservation[]>([])

    getReservationList() {
        this.isReservationLoading.set(true)
         this.reservationContent.set([])

        this.service.getReservesList()
            .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
                next: (res) => {
                    this.reservationContent.set(res?.content ?? [])
                    this.isReservationLoading.set(false);
                },
                error: (err) => {
                    this.isReservationLoading.set(false);
                    console.error(err);
                }
            })
    }


      // RESERVATION RESPONSE


    isNeedsLoading = signal<boolean>(false)
    needsContent = signal<ClientReservationNeeds[]>([])

    getNeedsList() {
        this.isNeedsLoading.set(true)
         this.needsContent.set([])

        this.service.getNeedsList()
            .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
                next: (res) => {
                    this.needsContent.set(res?.content ?? [])
                    this.isNeedsLoading.set(false);
                },
                error: (err) => {
                    this.isNeedsLoading.set(false);
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
 
    getStatusIcon(status: any): string {
     switch (status) {
      case STATUSES.NEW:
         return './assets/new-icons/kartoteka/status/new.svg';
       case STATUSES.ACTIVE:
         return './assets/new-icons/kartoteka/status/active.svg';
       case STATUSES.PARTIAL_CLOSED:
         return './assets/new-icons/kartoteka/status/partial-closed.svg';
       case STATUSES.DELETED:
         return './assets/new-icons/kartoteka/status/finished.svg';
      case STATUSES.RETURNED:
         return './assets/new-icons/kartoteka/status/returned.svg';
      case STATUSES.REJECTED:
         return './assets/new-icons/kartoteka/status/rejected.svg';
       default:
         return './assets/new-icons/kartoteka/status/unknown.svg';
     }
   }
}
