import { NgFor } from '@angular/common';
import { ChangeDetectionStrategy, Component, forwardRef, Input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {DOCUMENTS_TYPES2} from '../../types';

@Component({
  selector: 'app-document-format-selector2',
  imports: [NgFor],
  styles: [`
  img {
      width: 28px;
      height: 35px;
      transition: background-color 0.2s, color 0.2s;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DocumentFormatSelector2Component),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex space-x-2">
      <div *ngFor="let format of formats" (click)="selectFormat(format)"
        class="flex items-center justify-center cursor-pointer">
        @if (format === 'PDF') {
          <img [src]="selectedFormat() === format ? './assets/new-icons/PDF.svg' : './assets/new-icons/PDF_2.svg'" alt="" [style]="{height: '35px', width: '35px', opacity: selectedFormat() === format ? '1' : '0.6'}">
        }
        @if (format === 'EXCEL') {
          <img [src]="selectedFormat() === format ? './assets/new-icons/EXCEL.svg' : './assets/new-icons/EXCEL_2.svg'" alt="" [style]="{height: '35px', width: '35px', opacity: selectedFormat() === format ? '1' : '0.6'}">
        }
        @if (format === 'TXT') {
          <img [src]="selectedFormat() === format ? './assets/new-icons/TXT.svg' : './assets/new-icons/TXT_2.svg'" alt="" [style]="{height: '35px', width: '35px', opacity: selectedFormat() === format ? '1' : '0.6'}">
        }
        @if (format === 'CSV') {
          <img [src]="selectedFormat() === format ? './assets/new-icons/CSV.svg' : './assets/new-icons/CSV_2.svg'" alt="" [style]="{height: '35px', width: '35px', opacity: selectedFormat() === format ? '1' : '0.6'}">
        }
      </div>

    </div>
  `,
})
export class DocumentFormatSelector2Component implements ControlValueAccessor {
  @Input() formats: DOCUMENTS_TYPES2[] = ['PDF', 'EXCEL', 'TXT', "CSV"];
  @Input() size: number = 30;
  @Input() gap: number = 8;

  selectedFormat = signal<DOCUMENTS_TYPES2>('PDF');

  private onChange = (value: string) => { };
  private onTouched = () => { };

  writeValue(value: DOCUMENTS_TYPES2): void {
    if (value && this.formats.includes(value)) {
      this.selectedFormat.set(value);
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Handle disabled state if needed
  }

  selectFormat(format: DOCUMENTS_TYPES2): void {
    if (this.formats.includes(format)) {
      this.selectedFormat.set(format);
      this.onChange(this.selectedFormat());
      this.onTouched();
    }
  }
}
