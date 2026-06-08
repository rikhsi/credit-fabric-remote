import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter, Input,
  OnInit,
  Output
} from '@angular/core';
import { LocationBackDirective } from '../../directives/location-back.directive';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PaymentService } from '../../../core/services/payment.service';

@Component({
    selector: 'app-payment-title',
    imports: [
        LocationBackDirective,
        MatFormField,
        MatIcon,
        MatInput,
        MatLabel
    ],
    templateUrl: './payment-title.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentTitleComponent implements OnInit {
  num = '';
  isEditing = false;
  changedDocNum = '';
  @Input() docDate =  '';

  @Input() locationBack = false;
  @Output() docNum = new EventEmitter();

  constructor(
    private paymentService: PaymentService,
    private destroyRef: DestroyRef,
    private _cdRef: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
    this.getDocNum();
  }

  setDocNum(event: Event) {
    this.changedDocNum = (event.target as HTMLInputElement).value;
  }

  saveDocNum() {
    this.num = this.changedDocNum;
    this.docNum.emit(this.num);
    this.toggleEditMode();
    this._cdRef.markForCheck();
  }

  toggleEditMode() {
    this.isEditing = !this.isEditing;
    if(this.isEditing) {
      this.changedDocNum = this.num;
    } else {
      this.changedDocNum = '';
    }
  }

  getDocNum() {
    this.paymentService.getPaymentDocNum()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(val => {
        if(val) {
          this.num = val.msg;
          this.docNum.emit(val.msg);
          this._cdRef.markForCheck();
        }
      });
  }
}
