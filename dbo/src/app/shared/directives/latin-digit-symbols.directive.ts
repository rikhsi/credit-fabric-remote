import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appLatinDigitSymbols]',
  standalone: true,
})
export class LatinDigitSymbolsDirective {
  private regex: RegExp = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;

  constructor(private el: ElementRef) {}

  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    const char = String.fromCharCode(event.keyCode || event.which);
    if (!this.regex.test(char)) {
      event.preventDefault();
    }
  }
}
