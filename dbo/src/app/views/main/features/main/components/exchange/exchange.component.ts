import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, signal} from '@angular/core';
import {RightBarService} from '../../../../right-bar/services/right-bar.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {NgxMaskPipe} from 'ngx-mask';
import {CalculatorModalComponent} from "../../../../../../core/components/calculator-modal/calculator-modal.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
    selector: 'app-exchange',
  imports: [
    NgxMaskPipe
  ],
    templateUrl: './exchange.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExchangeComponent implements OnInit {
  data: any[] = [];
  selected!: any;
  isLoading = signal(false)
  loading = false;

  currencies = ['USD', 'EUR', 'RUB', 'CNY', 'GBP'];

  selectedCurrency = this.currencies[0];

  constructor(
    private rightBarService: RightBarService,
    private _cf: ChangeDetectorRef,
    private destroyRef: DestroyRef,
    private matDialog:MatDialog
  ) {
  }

  ngOnInit() {
    this.getCourse();
  }

  getCourse() {
    this.isLoading.set(true);
    this.rightBarService.getCurrencyRate()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (res: any) => {
        this.isLoading.set(false);
        if (res) {
          const seen = new Set();
          const removeCur = ["KZT", "JPY"]
          this.data =  res.result?.data?.content
            .filter((item: { alias: string; }) => !removeCur.includes(item.alias))
            .filter((item: { alias: unknown; }) => {
              if (seen.has(item.alias)) return false;
              seen.add(item.alias);
              return true;
            })
          if(this.data) {
            this.selected = this.data[0];
          }
        }
      },
      complete: () => {
        this._cf.detectChanges();
      }
    });
  }
  onOpenCalculator() {
    this.matDialog.open(CalculatorModalComponent, {
      disableClose: true,
      data: 'Hello World'
    })
  }

  protected readonly Date = Date;
}
