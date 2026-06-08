import {
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteTrigger, MatOption } from '@angular/material/autocomplete';
import { NgClass, NgForOf } from '@angular/common';
import { UiSvgIconComponent } from '../ui-svg-icon/ui-svg-icon.components';
import { MatLabel } from '@angular/material/select';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AlphaNumericSymbolMaskDirective } from '../../../shared/directives/alpha-numeric-symbol.directive';

@Component({
    selector: 'app-searchable',
    templateUrl: './searchable.component.html',
    styleUrls: ['./searchable.component.scss'],
    imports: [
        MatFormField,
        MatInput,
        MatLabel,
        ReactiveFormsModule,
        MatAutocompleteTrigger,
        NgClass,
        UiSvgIconComponent,
        MatAutocomplete,
        MatOption,
        NgForOf,
        AlphaNumericSymbolMaskDirective,
    ]
})
export class SearchableComponent implements OnInit {
  @ViewChild('inputElement') inputElement!: ElementRef<HTMLInputElement>;
  @Input() parentForm!: FormGroup;
  @Input() controlName!: string;
  @Input() placeholder: string = 'Введите код';
  @Input() options: any[] | null = [];
  @Input() label = '';
  @Input() iconPath: string = './assets/icons/btn-icons.svg#arrow_down';
  @Output() inputChange: EventEmitter<any> = new EventEmitter();
  @Output() valueChange: EventEmitter<any> = new EventEmitter();

  @Output() focus = new EventEmitter<void>();
  @Output() blur = new EventEmitter<void>();

  @Output() selectedOption = new EventEmitter();

  inputSubject = new Subject<any>();

  destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.inputSubject
      .pipe(debounceTime(800), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((val) => {
        this.inputChange.emit(val);
      })
  }

  onFocus(): void {
    this.focus.emit();
  }

  onBlur(): void {
    this.inputElement.nativeElement.blur();
    this.blur.emit();
  }

  onInput(event: Event) {
    let value = (event.target as HTMLInputElement)?.value.toUpperCase();
    this.inputElement.nativeElement.value = value;
    this.inputSubject.next(value);
  }

  onChange(event: any) {
    this.valueChange.emit(event);
  }

  onSelectOption(value: any) {
    this.selectedOption.emit(value);
    this.onBlur();
  }

  optionSelected(matOption: any) {
    this.valueChange.emit(matOption.option.value)
  }
}
