import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-slider-toggle',
  standalone: true,
  imports: [
    NgClass
  ],
  templateUrl: './slider-toggle.component.html',
  styleUrls: ['./slider-toggle.scss'],
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SliderToggleComponent {
  @Input() from: any = '';
  @Input() to: any = '';
  checked = true;
  @Output() change = new EventEmitter()

  onChange() {
    this.checked = !this.checked;
    this.change.emit(this.checked);
  }
}
