import {ChangeDetectionStrategy, Component, EventEmitter, inject, Inject, Input, OnInit, Output} from '@angular/core';
import {animate, style, transition, trigger} from "@angular/animations";
import {NgClass, NgIf} from "@angular/common";
import {TranslateModule} from "@ngx-translate/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-create-title-modal',
  imports: [
    NgIf,
    TranslateModule,
    NgClass,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './create-title-modal.component.html',
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
export class CreateTitleModalComponent implements OnInit {
  @Input() open = false;
  @Input() edit = false;
  @Input() title = '';

  @Output() agree = new EventEmitter<void>();
  @Output() setTitle = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  ngOnInit() {
  }


  onCancel() {
    this.cancel.emit();
  }

  onAgree() {
    this.agree.emit();
  }

  onSetTitle(event: any) {
    const title = event.target.value;
    this.setTitle.emit(title);
  }

  protected readonly Math = Math;
}
