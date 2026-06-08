import { Component, input, output } from '@angular/core';
import { NgIf, NgOptimizedImage } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltip } from '@angular/material/tooltip';
import { Router } from '@angular/router';

export type EmptyStateType = 'no-results' | 'empty';

export interface EmptyStateAction {
  label: string;           // translate key or raw string
  translateKey?: boolean;  // default true
  routerLink?: string;
  disabled?: boolean;
  disabledTooltip?: string;
}

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [NgIf, TranslateModule, MatTooltip, NgOptimizedImage],
  templateUrl:'./empty-state.component.html',
})
export class EmptyStateComponent {
  type = input<EmptyStateType>('empty');

  iconSrc = input<string | null>(null);

  titleKey = input<string | null>(null);
  title = input<string>('');

  descriptionKey = input<string | null>(null);
  description = input<string>('');

  action = input<EmptyStateAction | null>(null);

  height = input<string>('370px');

  actionClick = output<void>();

  constructor(private router: Router) {}

  resolvedIcon(): string {
    if (this.iconSrc()) return this.iconSrc()!;
    return this.type() === 'no-results'
      ? './assets/new-icons/search-history.svg'
      : './assets/new-icons/empty.svg';
  }

  onActionClick() {
    if (this.action()?.disabled) return;
    if (this.action()?.routerLink) {
      this.router.navigate([this.action()!.routerLink]);
    } else {
      this.actionClick.emit();
    }
  }
}
