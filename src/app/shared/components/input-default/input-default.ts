import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { NgxMaskDirective } from 'ngx-mask';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputDirective, NzInputSuffixDirective, NzInputWrapperComponent } from 'ng-zorro-antd/input';
import { ControlBaseDirective } from '@shared/directives';
import { ValidationMsgPipe, ValidationStatusPipe } from '@shared/pipes';

export type InputSanitize = 'digits' | 'letters';

@Component({
  selector: 'cf-input-default',
  imports: [
    NgxMaskDirective,
    NzInputWrapperComponent,
    NzInputDirective,
    NzFormModule,
    TranslocoDirective,
    ValidationStatusPipe,
    ValidationMsgPipe,
    FormsModule,
    NzInputSuffixDirective,
    NgClass,
  ],
  templateUrl: './input-default.html',
  styleUrl: './input-default.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputDefault extends ControlBaseDirective<string | null> {
  value = model(null);
  prefix = input<string>();
  suffix = input<string>();
  type = input<string>('text');

  mask = input<string>('');
  maskPrefix = input<string>('');
  thousandSeparator = input<string>('');
  /** Extra filter on top of mask — e.g. letters-only names (incl. Cyrillic). */
  sanitize = input<InputSanitize | null>(null);

  private focused = false;

  onFocus(): void {
    this.focused = true;
    this.focusChange.emit();
  }

  onValueChange(next: string | null): void {
    /** ngx-mask echoes an empty value back while writing the model value, which would wipe it and mark the field dirty. */
    if (!this.focused || next === this.value()) {
      return;
    }

    this.value.set(this.applySanitize(next));
  }

  private applySanitize(next: string | null): string | null {
    if (next == null) {
      return next;
    }

    switch (this.sanitize()) {
      case 'digits':
        return next.replace(/\D/g, '');
      case 'letters':
        // Letters (any script), spaces, hyphen and apostrophe — no digits/symbols.
        return next.replace(/[^\p{L}\s'-]/gu, '');
      default:
        return next;
    }
  }
}
