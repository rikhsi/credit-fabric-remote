import { NgFor } from '@angular/common';
import { ChangeDetectionStrategy, Component, forwardRef, Input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DOCUMENTS_TYPES } from '../../types';

@Component({
  selector: 'app-document-format-selector',
  imports: [NgFor],
  templateUrl: './document-format-selector.component.html',
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
      useExisting: forwardRef(() => DocumentFormatSelectorComponent),
      multi: true,
    },
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentFormatSelectorComponent implements ControlValueAccessor {
  @Input() formats: DOCUMENTS_TYPES[] = ['html', 'excel', 'pdf', 'word', "csv"];
  @Input() size: number = 30;
  @Input() gap: number = 8;

  selectedFormat = signal<DOCUMENTS_TYPES>('pdf');

  private onChange = (value: string) => { };
  private onTouched = () => { };

  writeValue(value: DOCUMENTS_TYPES): void {
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

  selectFormat(format: DOCUMENTS_TYPES): void {
    if (this.formats.includes(format)) {
      this.selectedFormat.set(format);
      this.onChange(this.selectedFormat());
      this.onTouched();
    }
  }
}
