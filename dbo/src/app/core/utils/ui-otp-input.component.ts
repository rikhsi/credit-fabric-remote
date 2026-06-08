import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';

const BACKSPACE_KEY = 'Backspace';
const ENTER_KEY = 'Enter';
const TAB_KEY = 'Tab';
const LEFT_KEY = 'ArrowLeft';
const RIGHT_KEY = 'ArrowRight';

@Component({
    selector: 'app-ui-otp-input',
    imports: [CommonModule],
    template: `<div class="flex items-center justify-center space-x-3">
    <div
      class="relative z-10 overflow-hidden"
      *ngFor="let item of [].constructor(count).fill(0)">
      <input
        type="text"
        class="otp-input w-[46px] h-[56px] text-center bg-cyan-75 rounded-0.5xl border-2 font-semibold text-[22px] peer"
        [ngClass]="
          isOtpIncorrect
            ? 'border-error outline-error'
            : 'border-zinc-150 outline-primary'
        "
        inputmode="numeric"
        pattern="[0-9]*"
        autocomplete="one-time-code"
        required />
      <span
        class="absolute w-2 h-2 -bottom-[3px] left-1/2 -translate-x-1/2 rounded-full z-20 empty:bg-zinc-150 peer-valid:bg-lime-550"
        [ngClass]="isOtpIncorrect ? '!bg-error' : 'bg-zinc-150'"></span>
    </div>
  </div>`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiOtpInputComponent implements AfterViewInit, OnDestroy {
  otpCode = '';
  inputs!: NodeListOf<HTMLInputElement>;
  @Input() isOtpIncorrect = false;
  @Input() count = 5;
  @Output() otpComplete = new EventEmitter<string>();
  constructor() {}

  ngAfterViewInit(): void {
    this.inputs = document.querySelectorAll('.otp-input');
    this.init();
  }

  ngOnDestroy(): void {
    this.inputs.forEach((input) => {
      input.removeEventListener('input', () => {});
      input.removeEventListener('paste', () => {});
      input.removeEventListener('keydown', () => {});
    });
  }

  init() {
    this.inputs.forEach((input, i) => {
      i === 0 && input.focus();
      this.registerEvents(input, i);
    });
  }

  registerEvents(element: HTMLInputElement, index: number): void {
    element?.addEventListener('input', (ev) => {
      this.onInput(index, ev);
    });
    element?.addEventListener('paste', (ev) => {
      this.onPaste(index, ev);
    });
    element?.addEventListener('keydown', (ev) => {
      this.onKeyDown(index, ev);
    });
  }

  onPaste(index: number, ev: ClipboardEvent) {
    ev.preventDefault();
    let curIndex = index;
    const clipboardData =
      ev.clipboardData || window.ClipboardEvent.prototype.clipboardData;
    const pastedData = clipboardData?.getData('Text');
    if (pastedData) {
      for (let i = 0; i < pastedData.length; i++) {
        if (i < this.inputs.length) {
          if (!this.isDigit(pastedData[i])) break;
          this.inputs[curIndex].value = pastedData[i];
          curIndex++;
        }
      }
      if (curIndex == this.inputs.length) {
        this.inputs[curIndex - 1].focus();
        this.retrieveOTP();
      } else {
        this.inputs[curIndex].focus();
      }
    }
  }

  onKeyDown(index: number, ev: KeyboardEvent) {
    const key = ev.key;

    if (key == LEFT_KEY && index > 0) {
      ev.preventDefault(); // prevent cursor to move before digit in input
      this.inputs[index - 1].focus();
    }
    if (key == RIGHT_KEY && index + 1 < this.inputs.length) {
      ev.preventDefault();
      this.inputs[index + 1].focus();
    }
    if (key == BACKSPACE_KEY && index > 0) {
      if (this.inputs[index].value == '') {
        // Empty and focus previous input and current input is empty
        this.inputs[index - 1].value = '';
        this.inputs[index - 1].focus();
      } else {
        this.inputs[index].value = '';
      }
    }
    if (key == ENTER_KEY) {
      // force submit if enter is pressed
      ev.preventDefault();
      if (this.isOTPComplete) {
        this.retrieveOTP();
      }
    }
    if (key == TAB_KEY && index == this.inputs.length - 1) {
      // force submit if tab pressed on last input
      ev.preventDefault();
      if (this.isOTPComplete) {
        this.retrieveOTP();
      }
    }
  }

  onInput(index: number, ev: InputEvent | Event) {
    const value =
      (ev as InputEvent).data || (ev.target as HTMLInputElement)?.value;
    let curIndex = index;
    for (let i = 0; i < value.length; i++) {
      if (i < this.inputs.length) {
        if (!this.isDigit(value[i])) {
          this.inputs[curIndex].value = '';
          break;
        }
        this.inputs[curIndex++].value = value[i];
        if (curIndex == this.inputs.length) {
          if (this.isOTPComplete) {
            this.retrieveOTP();
          }
        } else {
          this.inputs[curIndex].focus();
        }
      }
    }
  }

  retrieveOTP() {
    for (let i = 0; i < this.inputs.length; i++) {
      this.otpCode += this.inputs[i].value;
    }
    this.otpComplete.emit(this.otpCode.slice(-5));
  }

  isDigit(d: string) {
    return d >= '0' && d <= '9';
  }

  get isOTPComplete() {
    let isComplete = true;
    let i = 0;
    while (i < this.inputs.length && isComplete) {
      if (this.inputs[i].value == '') {
        isComplete = false;
      }
      i++;
    }
    return isComplete;
  }
}
