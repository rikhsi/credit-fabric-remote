// // Angular
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DestroyRef, inject, Injectable, signal } from "@angular/core";

// // Service
import { SharedService } from "../services/shared.service";
import { AccountResponseType } from "src/app/core/models/currencies-account-reponse-types.model";





@Injectable({ providedIn: 'root' })

export class CurrencyStore {
    private readonly service = inject(SharedService);
    private readonly destroyRef = inject(DestroyRef);

     loading = signal<boolean>(false)
     content = signal<AccountResponseType[]>([]);
     currencyList = signal<{ code: string; flag: string }[]>([])


    loadCurrency() {
        this.loading.set(true);
        this.service.getGlobalCurrency()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (res) => {
                    this.content.set(res?.accountResponseType ?? []);
                    const result = res?.currencyList.map((v => ({
                        code: v.name,
                        flag: v.logo.path + v.logo.name
                    })))
                    this.currencyList.set(result ?? []);
                    this.loading.set(false);
                },
                error: (err) => {
                    this.loading.set(false);
                    console.error(err);
                }
            });
    }
}
