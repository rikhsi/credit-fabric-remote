import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Router, RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-conversion',
  imports: [TranslateModule, RouterOutlet, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./conversion.component.scss'],
  template: `
    <div class="h-full flex flex-col gap-y-5">
      <div class="text-[28px] font-bold text-[#171717]">{{ 'main.conversion' | translate }}</div>

      <div class="flex gap-x-2">
        @for (tab of tabs; track tab.key) {
          <button
            (click)="navigate(tab.key)"
            class="font-semibold leading-5 px-[15px] py-[10px] rounded-[14px] border transition-all"
            [ngClass]="isActive(tab.key)
              ? 'bg-surface-2 border-custom-border text-custom-primary'
              : 'bg-transparent border-transparent text-custom-muted'">
            {{ tab.translateKey | translate }}
            @if (tab.key === 'na-podpis') {
              <span class="bg-primary-base text-white rounded-full text-[12px] px-[6px] py-[4px] ml-2">
                {{ signatureCount() }}
              </span>
            }
          </button>
        }
      </div>

      <router-outlet></router-outlet>
    </div>
  `,
})
export class ConversionComponent {
  private router = inject(Router);

  signatureCount = signal(0);

  tabs = [
    { key: 'all',          translateKey: 'accountStatements.all' },
    { key: 'na-podpis',    translateKey: 'myAccounts.for_signature' },
    { key: 'na-dorabotke', translateKey: 'new_third.under_development' },
    { key: 'oshibka',      translateKey: 'accountStatements.error' },
  ];

  navigate(key: string) {
    this.router.navigate(['/ved-conversion', key]);
  }

  isActive(key: string): boolean {
    const url = this.router.url;
    return url.startsWith(`/ved-conversion/${key}`);
  }
}
