import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DestroyRef, inject, Injectable, signal } from "@angular/core";

import { CorpCardService } from "../services/corp-card.service";
import { LimitCategory, LimitInfo } from "../model/limit.model";



@Injectable({ providedIn: 'root' })

export class CorpCardLimitStore {
    private readonly service = inject(CorpCardService);
    private readonly destroyRef = inject(DestroyRef);


    limitCategories = signal<LimitCategory[] | null>(null);
    limitInfo = signal<LimitInfo | null>(null);
    limitHistory = signal<LimitInfo[]>([])



    loadLimitCategories() {
        this.service.getLimitCategory()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (res) => {
                    if (res?.result.length) {
                        const result = [{
                            name: "POS",
                            limitId: res?.result[0].limitId
                        }]
                        this.limitCategories.set(result);
                    } else {
                        this.limitCategories.set([{
                            name: "POS",
                            limitId: 40
                        }]);
                    }



                },
                error: (err) => {
                    console.error('Limit category load error', err);
                }
            });
    }


    loadLimitInfo({ id }: { id: string }) {
        this.service.getLimitInfo({ id })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (res) => {
                    this.limitInfo.set(res);
                },
                error: (err) => {
                    console.error('Limit info load error', err);
                }
            });
    }


    loadLimitHistory({ id }: { id: string }) {
        this.service.getLimitHistory({ id })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (res) => {
                    this.limitHistory.set(res ?? []);
                },
                error: (err) => {
                    console.error('Limit hisotry load error', err);
                }
            });
    }

}
