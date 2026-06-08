import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-select',
    imports: [],
    templateUrl: './select.component.html',
    styles: ``,
    styleUrls: ['./select.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectComponent {
  @Input() titles: any[] = [];
  @Input() values: any[] = [];
  @Output() value = new EventEmitter();

  @Input() selectedValue = this.values[0];

  onChange(event: any) {
    this.value.emit(event.target.value);
  }
}
