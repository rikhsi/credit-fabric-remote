import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appNumericOnly]',
  standalone: true
})
export class NumericOnlyDirective {

  @HostListener('keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
    if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  }
}