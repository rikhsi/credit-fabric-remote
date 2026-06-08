import { ChangeDetectionStrategy, Component, DestroyRef, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { AmountService } from '../../../../../../core/services/amount.service';
import { bookingOperationColumns } from '../../constants/table-columns';
import {
  ContainerTableComponent
} from '../../../../../../shared/components/common/container-table/container-table.component';
import { NgIf } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatRipple } from '@angular/material/core';

@Component({
    selector: 'app-booking-modal',
    imports: [
        ContainerTableComponent,
        NgIf,
        MatIcon,
        MatRipple,
        MatDialogClose
    ],
    templateUrl: './booking-modal.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingModalComponent {
  historyData = [];
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private destroyRef: DestroyRef,
    public amountService: AmountService,
  ) {
  }

  protected readonly operationColumns = bookingOperationColumns;
}
