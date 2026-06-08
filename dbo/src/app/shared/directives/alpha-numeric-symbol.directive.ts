import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[alphaNumericSymbolMask]'
})
export class AlphaNumericSymbolMaskDirective {
  private allowedCharsRegex = /^[a-zA-Z0-9!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~ ]*$/;

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: InputEvent): void {
    const input = this.el.nativeElement as HTMLInputElement;
    const originalValue = input.value;
    input.value = input.value.toUpperCase();

    // Filter the input value to remove any disallowed characters
    const filteredValue = Array.from(originalValue)
      .filter(char => this.allowedCharsRegex.test(char))
      .join('');

    // If the value has changed, update the input's value
    if (originalValue !== filteredValue) {
      input.value = filteredValue.toUpperCase();
    }
  }

  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent): void {
    // Prevent the user from typing disallowed characters
    if (!this.allowedCharsRegex.test(event.key)) {
      event.preventDefault();
    }
  }
}
