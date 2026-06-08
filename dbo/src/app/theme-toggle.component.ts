import { Component } from '@angular/core';
import { ThemeService } from './shared/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  template: `
    <label class="relative inline-block cursor-pointer">
      <input
        type="checkbox"
        class="sr-only"
        (change)="theme.toggle()"
        [checked]="theme.isDark()"
      />

      <div
        class="w-14 h-8 rounded-full relative transition-colors duration-300 border border-[#ebebeb] dark:border-[#333]"
        [style.backgroundColor]="theme.isDark() ? '#262626' : '#F7F7F7'">

        <div
          class="absolute top-[1px] left-[2px] w-7 h-7 bg-[#00A38D] rounded-full shadow-md flex items-center justify-center transition-transform duration-300"
          [style.transform]="theme.isDark() ? 'translateX(24px)' : 'translateX(0)'">

          <img
            class="select-none"
            [src]="theme.isDark() ? './assets/new-icons/moon-01.svg' : './assets/new-icons/sun.svg'"
            alt="theme-icon" />
        </div>
      </div>
    </label>
  `
})
export class ThemeToggleComponent {
  constructor(public theme: ThemeService) {}
}
