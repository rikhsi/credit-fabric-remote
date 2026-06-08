import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Inject,
  Input,
  OnInit,
  output,
  Output
} from '@angular/core';
import {animate, style, transition, trigger} from "@angular/animations";
import {NgClass, NgIf} from "@angular/common";
import {TranslateModule} from "@ngx-translate/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {TransactionDetailComponent} from "../../../../transaction-detail/transaction-detail.component";

@Component({
  selector: 'app-rate-modal',
  imports: [
    NgIf,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './rate-modal.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('dialogAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.8)' }))
      ])
    ])
  ],
})
export class RateModalComponent implements OnInit {
  public data: any = inject(MAT_DIALOG_DATA)
  public readonly onClose = output<string>()
  protected _matDialogRef =  inject(MatDialogRef<RateModalComponent>)

  ngOnInit() {

  }

  onCancel() {
    this._matDialogRef.close();
  }

  protected readonly Math = Math;
}
