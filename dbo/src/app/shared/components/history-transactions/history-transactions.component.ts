import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { NgxMaskPipe } from 'ngx-mask';
import { UiSvgIconComponent } from '../../../core/components/ui-svg-icon/ui-svg-icon.components';

@Component({
    selector: 'app-history-transactions',
    imports: [
        NgxMaskPipe,
        UiSvgIconComponent
    ],
    templateUrl: './history-transactions.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryTransactionsComponent implements OnInit {
  @Input() transactions: any[] = [];
  @Input() loading = false;

  constructor() {
  }

  ngOnInit() {
  }
}
