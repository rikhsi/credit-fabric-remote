import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-vat',
    imports: [
        NgClass
    ],
    templateUrl: './vat.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VatComponent {
  @Input() vats = [
    {
      title: 'Не облагается',
      value: '',
    },
    {
      title: '0%',
      value: 'НДС 0%',
    },
    {
      title: '10%',
      value: 'НДС 10%',
    },
    {
      title: '15%',
      value: 'НДС 15%',
    },
    {
      title: '20%',
      value: 'НДС 20%',
    },
    {
      title: 'Ручной ввод',
      value: '',
    },
  ];

  @Output() vatSelected = new EventEmitter();

  selectedVat = this.vats[0];

  selectVat(vat: any) {
    this.selectedVat = vat;
    this.vatSelected.emit(this.selectedVat.value);
  }
}
