import { ChangeDetectionStrategy, Component, ElementRef, input, output, viewChild } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { BounceDirective } from '@shared/directives';

@Component({
  selector: 'cf-form-box',
  imports: [NzButtonComponent, NzTypographyComponent, NzIconDirective, TranslocoDirective, BounceDirective],
  templateUrl: './form-box.html',
  styleUrl: './form-box.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormBox {
  public title = input<string>();

  public closeClick = output<void>();
  public submitClick = output<void>();

  private readonly body = viewChild.required<ElementRef<HTMLElement>>('body');

  public submit(): void {
    this.submitClick.emit();

    /** Errors are rendered only after the parent form marks its fields as dirty. */
    setTimeout(() => this.scrollToFirstError(), 0);
  }

  private scrollToFirstError(): void {
    const body = this.body().nativeElement;
    const error = body.querySelector('.ant-form-item-explain-error');
    const target = error?.closest('.ant-form-item') ?? error;

    if (!target) {
      return;
    }

    const top = body.scrollTop + target.getBoundingClientRect().top - body.getBoundingClientRect().top - 16;

    body.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }
}
