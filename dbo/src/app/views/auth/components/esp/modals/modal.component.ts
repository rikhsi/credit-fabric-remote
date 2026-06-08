import { Component, EventEmitter, Output, Input } from '@angular/core';
import {NgIf} from "@angular/common";

@Component({
  selector: 'modal-esp',
  templateUrl: './modal.component.html',
  imports: [
    NgIf
  ]
})
export class ModalComponent {
  @Input() title = '';
  @Input() visible = false;
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
