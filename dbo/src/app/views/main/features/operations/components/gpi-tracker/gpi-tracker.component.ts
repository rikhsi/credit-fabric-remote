import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit } from '@angular/core';
import { OperationsService } from '../../services/operations.service';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { ContainerTitleComponent } from '../../../../../../shared/components/container-title/container-title.component';
import { IGpiTracker, Tracker } from '../../interfaces/gpi-tracker.interface';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader } from '@angular/material/expansion';
import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { AmountService } from '../../../../../../core/services/amount.service';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-gpi-tracker',
    imports: [
        ContainerTitleComponent,
        MatAccordion,
        MatExpansionPanel,
        MatExpansionPanelHeader,
        NgForOf,
        NgClass,
        NgIf,
        DatePipe,
        MatIcon
    ],
    templateUrl: './gpi-tracker.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GpiTrackerComponent implements OnInit {
  title = 'GPI Tracker';
  transactionId!: number;
  updatedAt!: string;
  receiverBic!: string;
  senderCurrency!: string;
  senderAmount!: number;

  gpiTracker!: IGpiTracker;
  trackerList: Tracker[] = [];

  constructor(
    private destroyRef: DestroyRef,
    private operationService: OperationsService,
    private activatedRoute: ActivatedRoute,
    private toastrService: ToastrService,
    private _cdRef: ChangeDetectorRef,
    public amountService: AmountService,
  ) {
  }

  ngOnInit() {
    this.watchRoute();
  }

  watchRoute() {
    this.activatedRoute.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(query => {
        this.transactionId = +(query['transactionId'] || 0);

        this.updatedAt = query['updatedAt'];
        this.receiverBic = query['receiverBic'];
        this.senderCurrency = query['senderCurrency'];

        this.senderAmount = +(query['senderAmount'] || 0);

        this.getGpiTracker();
      });
  }

  getGpiTracker() {
    const payload = {
      transactionId: this.transactionId,
      receiverBic: this.receiverBic,
      senderCurrency: this.senderCurrency,
      updatedAt: this.updatedAt,
      senderAmount: this.senderAmount,
    }
    this.operationService.getGpiTracker(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          this.gpiTracker = res;
          this.trackerList = res.trackerList;
          this._cdRef.markForCheck();
        },
        error: (err) => {
          const message = err.message || err || 'Ошибка!';
          this.toastrService.error(message);
        }
      });
  }

  getSentTimeAsDate(dateString?: string): Date {
    let dateRaw = '';
    if(!dateString) {
      dateRaw = new Date().toISOString();
    } else {
      dateRaw = dateString;
    }
    // Convert '25-12-2024 16:10 +0500' → '2024-12-25T16:10:00+05:00'
    const isoString = dateRaw.replace(
      /(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}) \+(\d{4})/,
      (match, day, month, year, hour, minute, offset) => {
        const formattedOffset = `${offset.slice(0, 2)}:${offset.slice(2)}`;
        return `${year}-${month}-${day}T${hour}:${minute}:00+${formattedOffset}`;
      }
    );
    return new Date(isoString);
  }

  scale(n?: any) {
    if(!n) return 100;
    return Math.pow(10, n);
  }
}
