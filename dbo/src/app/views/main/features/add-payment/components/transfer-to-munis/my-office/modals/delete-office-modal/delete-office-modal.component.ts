import {ChangeDetectionStrategy, Component, EventEmitter, inject, Inject, Input, OnInit, Output} from '@angular/core';
import {animate, style, transition, trigger} from "@angular/animations";
import {NgClass, NgIf} from "@angular/common";
import {TranslateModule} from "@ngx-translate/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-delete-office-modal',
  imports: [
    NgIf,
    TranslateModule,
    NgClass,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './delete-office-modal.component.html',
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
export class DeleteOfficeModalComponent implements OnInit {
  @Input() open = false;
  @Input() title = '';

  @Output() agree = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  ngOnInit() {
  }


  onCancel() {
    this.cancel.emit();
  }

  onAgree() {
    this.agree.emit();
  }

  protected readonly Math = Math;
}
