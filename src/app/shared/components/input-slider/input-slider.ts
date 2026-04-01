import { ChangeDetectionStrategy, Component, computed, inject, input, model } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { translate, TranslocoService } from '@jsverse/transloco';
import { NzSliderModule, NzMarks } from 'ng-zorro-antd/slider';
import { startWith } from 'rxjs';
import { InputDefault } from '../input-default/input-default';
import { PLURALIZE_FORMS_BY_TYPE } from '@constants';
import { pluralize } from '@shared/utils';
import { PluralizeType } from '@typings';

@Component({
  selector: 'cf-input-slider',
  imports: [FormsModule, NzSliderModule, InputDefault],
  templateUrl: './input-slider.html',
  styleUrl: './input-slider.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputSlider {
  private readonly transloco = inject(TranslocoService);

  /** Активный язык — чтобы пересчитать подписи при смене. */
  private readonly lang = toSignal(this.transloco.langChanges$.pipe(startWith(this.transloco.getActiveLang())));

  /** Максимум шкалы (как у nz-slider). */
  readonly max = input.required<number>();

  /** Минимум шкалы. */
  readonly min = input<number>(0);

  /** Шаг; если не задан — выводится от диапазона max − min. */
  readonly step = input<number | undefined>(undefined);

  readonly prefixType = input<PluralizeType>('money');

  readonly disabled = input<boolean>(false);

  /** Текущее значение ползунка. Пока не задано — используется середина диапазона. */
  readonly value = model<number | undefined>(undefined);

  readonly effectiveStep = computed(() => {
    const step = this.step();
    if (step != null && step > 0) {
      return step;
    }
    const range = this.max() - this.min();
    return Math.max(1, Math.floor(range / 500) || 1);
  });

  readonly boundValue = computed(() => {
    const min = this.min();
    const max = this.max();
    const raw = this.value();
    const fallback = Math.min(max, Math.max(min, Math.round((min + max) / 2)));
    const v = raw == null ? fallback : raw;
    return Math.min(max, Math.max(min, v));
  });

  readonly nzMarks = computed(() => {
    this.lang();
    const min = this.min();
    const max = this.max();
    const mid = Math.round((min + max) / 2);
    const type = this.prefixType();
    const marks: NzMarks = {};
    marks[min] = this.formatScaleLabel(min, type);
    if (mid > min && mid < max) {
      marks[mid] = this.formatScaleLabel(mid, type);
    }
    marks[max] = this.formatScaleLabel(max, type);
    return marks;
  });

  readonly displayPrimary = computed(() => {
    this.lang();
    return this.formatPrimaryLabel(this.boundValue(), this.prefixType());
  });

  onSliderChange(v: number): void {
    this.value.set(v);
  }

  private formatSpacedInteger(n: number): string {
    return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0, useGrouping: true }).format(n);
  }

  private forms(type: PluralizeType): [string, string, string] {
    return PLURALIZE_FORMS_BY_TYPE[type];
  }

  /** Крупная подпись (карточка сверху): полное число + форма по prefixType. */
  private formatPrimaryLabel(n: number, type: PluralizeType): string {
    const suffix = translate(pluralize(n, this.forms(type)));
    return `${this.formatSpacedInteger(n)} ${suffix}`;
  }

  /**
   * Подписи min / mid / max: для money от 1e6 — «N млн» + форма по типу;
   * иначе — короткое число + форма.
   */
  private formatScaleLabel(n: number, type: PluralizeType): string {
    const forms = this.forms(type);
    if (type === 'money' && n >= 1_000_000) {
      const millions = n / 1_000_000;
      const display = millions % 1 === 0 ? millions : Math.round(millions * 10) / 10;
      const pluralCount = Math.trunc(display) || 1;
      const suffix = translate(pluralize(pluralCount, forms));
      return `${display} млн ${suffix}`;
    }
    const suffix = translate(pluralize(n, forms));
    return `${this.formatSpacedInteger(n)} ${suffix}`;
  }
}
