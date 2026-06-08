import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-custom-checkbox',
  imports: [FormsModule, NgClass],
  templateUrl: './custom-checkbox.component.html',
  styles: `
    :host-context(.dark) label span {
      color: white !important;
    }
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomCheckboxComponent),
      multi: true,
    },
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomCheckboxComponent implements ControlValueAccessor {
  @Input() label: string = 'Checkbox';
  @Input() showIcon: boolean = true;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() labelColor: string = '#5C5C5C'

  value: boolean = false;
  disabled: boolean = false;

  private onChange = (value: boolean) => { };
  private onTouched = () => { };

  get sizeStyles() {
    switch (this.size) {
      case 'small':
        return {
          label: 'text-sm',
          checkbox: 'w-4 h-4 after:w-1.5 after:h-1',
          text: 'text-sm',
          icon: 'w-3 h-3',
        };
      case 'large':
        return {
          label: 'text-lg',
          checkbox: 'w-7 h-7 after:w-3.5 after:h-2',
          text: 'text-lg',
          icon: 'w-5 h-5',
        };
      case 'medium':
      default:
        return {
          label: 'text-14 font-normal',
          checkbox: 'w-5 h-5 after:w-2.5 after:h-1.5',
          text: 'text-14',
          icon: 'w-4 h-4',
        };
    }
  }


  writeValue(value: boolean): void {
    this.value = value;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onChangeEvent(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.checked;
    this.onChange(this.value);
    this.onTouched();
  }
}
