import { NgClass } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  QueryList,
  ViewChildren
} from '@angular/core';

const BACKSPACE_KEY = 'Backspace';
const ENTER_KEY = 'Enter';
const TAB_KEY = 'Tab';
const LEFT_KEY = 'ArrowLeft';
const RIGHT_KEY = 'ArrowRight';

@Component({
    selector: 'app-ui-otp-input',
    template: `
    <div class="flex items-center justify-between otp-input-box">
      @for (item of [].constructor(count).fill(0); track item) {
        <div
          class="relative z-10 overflow-hidden"
        >
          <input
            type="text"
            [style.box-shadow]=""
            class="otp-input w-[46px] border border-custom-border bg-surface-4 h-[56px] text-custom-primary text-center outline-none focus:border-custom-border focus:border  focus:bg-surface-4 mx-2 rounded-[8px] font-semibold text-[15px] peer"
            [ngClass]="
          isOtpIncorrect
            ? 'border-error outline-error'
            : ''
        "
            inputmode="numeric"
            pattern="[0-9]*"
            autocomplete="one-time-code"
            required
            #otpInput/>
        </div>
      }
    </div>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgClass]
})
export class UiOtpInputComponent implements AfterViewInit, OnDestroy {
  @Input() public isOtpIncorrect = false;
  @Input() public count = 6;
  @Output() public otpComplete = new EventEmitter<string>();
  @Output() public inputChange = new EventEmitter<string>();
  @ViewChildren('otpInput') public inputs: QueryList<ElementRef> | undefined;

  public otpCode = '';

  private get _isOTPComplete(): boolean {
    let isComplete = true;
    let i = 0;
    if (this.inputs) {
      while (i < this.inputs.length && isComplete) {
        if (this.inputs.get(i)?.nativeElement.value == '') {
          isComplete = false;
        }
        i++;
      }
    }
    return isComplete;
  }

  public ngAfterViewInit(): void {
    this.inputs?.forEach((input, i) => {
      this.registerEvents(input.nativeElement, i);
    });
    this.inputs?.first.nativeElement.focus();
  }

  private registerEvents(element: HTMLInputElement, index: number): void {
    element?.addEventListener('input', (ev) => {
      this.onInput(index, ev);
      this.inputChange.emit("change")
    });
    element?.addEventListener('paste', (ev) => {
      this.onPaste(index, ev);
      this.inputChange.emit("change")

    });
    element?.addEventListener('keydown', (ev) => {
      this.onKeyDown(index, ev);
      this.inputChange.emit("change")
    });
  }

  private onPaste(index: number, ev: ClipboardEvent): void {
    ev.preventDefault();
    let curIndex = index;
    const clipboardData =
      ev.clipboardData || window.ClipboardEvent.prototype.clipboardData;
    const pastedData = clipboardData?.getData('Text');
    if (pastedData && this.inputs) {
      for (let i = 0; i < pastedData.length; i++) {
        if (i < this.inputs.length) {
          if (!this.isDigit(pastedData[i])) break;
          const input = this.inputs.get(curIndex)?.nativeElement;
          input.value = pastedData[i];
          curIndex++;
        }
      }
      if (curIndex == this.inputs.length) {
        this.inputs.get(curIndex - 1)?.nativeElement.focus();
        this.retrieveOTP();
      } else {
        this.inputs.get(curIndex)?.nativeElement.focus();
      }
    }
  }

  private onKeyDown(index: number, ev: KeyboardEvent): void {
    if (this.inputs) {
      const key = ev.key;

      if (key == LEFT_KEY && index > 0) {
        ev.preventDefault(); // prevent cursor to move before digit in input
        this.inputs.get(index - 1)?.nativeElement.focus();
      }
      if (key == RIGHT_KEY && index + 1 < this.inputs.length) {
        ev.preventDefault();
        this.inputs.get(index + 1)?.nativeElement.focus();
      }
      if (key == BACKSPACE_KEY && index > 0) {
        if (this.inputs.get(index)?.nativeElement.value == '') {
          // Empty and focus previous input and current input is empty
          const input = this.inputs.get(index)?.nativeElement;
          input.value = '';
          this.inputs.get(index - 1)?.nativeElement.focus();
        } else {
          const input = this.inputs.get(index)?.nativeElement;
          input.value = '';
        }
      }
      if (key == ENTER_KEY) {
        // force submit if enter is pressed
        ev.preventDefault();
        if (this._isOTPComplete) {
          this.retrieveOTP();
        }
      }
      if (key == TAB_KEY && index == this.inputs.length - 1) {
        // force submit if tab pressed on last input
        ev.preventDefault();
        if (this._isOTPComplete) {
          this.retrieveOTP();
        }
      }
    }
  }

  private onInput(index: number, ev: InputEvent | Event): void {
    const value =
      (ev as InputEvent).data || (ev.target as HTMLInputElement)?.value;
    let curIndex = index;
    for (let i = 0; i < value.length; i++) {
      if (this.inputs && i < this.inputs.length) {
        if (!this.isDigit(value[i])) {
          const input = this.inputs.get(curIndex)?.nativeElement;
          input.value = '';
          break;
        }
        const input = this.inputs.get(curIndex++)?.nativeElement;
        input.value = value[i];
        if (curIndex == this.inputs.length) {
          if (this._isOTPComplete) {
            this.retrieveOTP();
          }
        } else {
          this.inputs.get(curIndex)?.nativeElement.focus();
        }
      }
    }
  }

  private retrieveOTP(): void {
    if (this.inputs) {
      for (let i = 0; i < this.inputs.length; i++) {
        this.otpCode += this.inputs.get(i)?.nativeElement.value;
      }
      this.otpComplete.emit(this.otpCode.slice(-6));
    }
  }

  private isDigit(d: string): boolean {
    return d >= '0' && d <= '9';
  }

  public ngOnDestroy(): void {
    this.inputs?.forEach((input, i) => {
      input.nativeElement.removeEventListener('input', (ev: Event) => {
        this.onInput(i, ev);
      });
      input.nativeElement.removeEventListener('paste', (ev: ClipboardEvent) => {
        this.onPaste(i, ev);
      });
      input.nativeElement.removeEventListener(
        'keydown',
        (ev: KeyboardEvent) => {
          this.onKeyDown(i, ev);
        }
      );
    });
  }
  clearSmsInput(): void {
    this.otpCode = '';
    if (this.inputs) {
      this.inputs.forEach((inputRef) => {
        inputRef.nativeElement.value = '';
      });

      this.inputs.first.nativeElement.focus();
    }
  }
}
