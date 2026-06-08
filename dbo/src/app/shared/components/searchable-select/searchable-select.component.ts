import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input, OnChanges,
  OnInit,
  Output, SimpleChanges,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { MatError, MatFormField, MatFormFieldModule, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteTrigger, MatOption } from '@angular/material/autocomplete';
import { NgClass, NgForOf, NgIf, NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import { MatLabel } from '@angular/material/select';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UiSvgIconComponent } from '../../../core/components/ui-svg-icon/ui-svg-icon.components';
import { MatIcon } from '@angular/material/icon';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
    selector: 'app-searchable-select',
    templateUrl: './searchable-select.component.html',
    styleUrls: ['./searchable-select.component.scss'],
    imports: [
        MatFormFieldModule,
        MatInput,
        MatLabel,
        ReactiveFormsModule,
        MatAutocompleteTrigger,
        NgClass,
        UiSvgIconComponent,
        MatAutocomplete,
        MatOption,
        NgForOf,
        NgTemplateOutlet,
        MatIcon,
        MatSuffix,
        NgOptimizedImage,
        InfiniteScrollDirective,
        NgxMaskDirective,
        NgIf,
    ]
})
export class SearchableSelectComponent implements OnInit, OnChanges {
  @ViewChild(MatAutocompleteTrigger) private _autocompleteTrigger!: MatAutocompleteTrigger;
  @Input() parentForm!: FormGroup;
  @Input() controlName!: string;
  @Input() placeholder: string = 'Поиск...';
  @Input() options: any[] | null = [];
  temporalOptions: any[] | null = [];
  @Input() label = '';
  @Input() iconPath: string = './assets/icons/btn-icons.svg#arrow_down';
  @Input() maxlength!: number;
  @Input() type = 'text';
  @Input() showSuffix = true;

  @Input() displayOption: (option: any) => string = (option) => option;

  @Output() inputChange: EventEmitter<any> = new EventEmitter();
  @Output() valueChange: EventEmitter<any> = new EventEmitter();
  @Output() scrolled = new EventEmitter();


  @Input() customTriggerTemplate!: TemplateRef<any>;
  @Input() customOptionTemplate!: TemplateRef<any>;

  private scrollSubject = new Subject<void>();
  inputSubject = new Subject<any>();

  destroyRef = inject(DestroyRef);
  private _cdRef = inject(ChangeDetectorRef);

  ngOnInit() {
    this.inputSubject
      .pipe(debounceTime(800), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((val) => {
        this.inputChange.emit(val)
      });

    this.scrollSubject
      .pipe(debounceTime(600))
      .subscribe(() => {
        this.scrolled.emit();
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['options'] && this.options && this.options.length > 0) {
      this.openAutocomplete();
    }
  }

  get control(): FormControl<any> {
    return this.parentForm.get(this.controlName) as FormControl<any>;
  }

  onInput(event: Event) {
    const inputElement = (event.target as HTMLInputElement);
    const maxLength = this.maxlength
    if(maxLength && inputElement.value.length > maxLength) {
      inputElement.value = inputElement.value.slice(0, maxLength);
    }
    let value = inputElement?.value;
    this.inputSubject.next(value);
  }

  onChange(event: any) {
    this.valueChange.emit(event);
  }

  openAutocomplete(): void {
    this.temporalOptions = this.options;
  }

  optionSelected(matOption: any) {
    this.valueChange.emit(matOption.option.value)
  }

  onOptionSelected(event: any, input: HTMLInputElement) {
    this.temporalOptions = [];
    this._autocompleteTrigger.closePanel();

    this._cdRef.detectChanges();
  }


  onScroll() {
    this.scrollSubject.next();
  }
}
