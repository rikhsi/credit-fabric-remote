import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter, Input,
  OnInit,
  Output
} from '@angular/core';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { NgxMaskPipe } from 'ngx-mask';
import { OperDayComponent } from '../../../views/main/features/new-payment/components/oper-day/oper-day.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AccountsPaymentsService
} from '../../../views/main/features/accounts-payments/services/accounts-payments.service';
import { TemplatesComponent } from '../templates/templates.component';
import { LastOperationsComponent } from '../last-operations/last-operations.component';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
    selector: 'app-widgets',
    imports: [
        NgOptimizedImage,
        NgxMaskPipe,
        OperDayComponent,
        TemplatesComponent,
        LastOperationsComponent,
        NgClass,
        MatTooltip
    ],
    templateUrl: './widgets.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WidgetsComponent {
  @Output() docDate = new EventEmitter();
  @Input() showTemplates = true;
  @Input() lastPayments = false;

  @Input() modes!: string[];

  isOpen = false;

  toggleOpen() {
    this.isOpen = !this.isOpen;
  }
}
