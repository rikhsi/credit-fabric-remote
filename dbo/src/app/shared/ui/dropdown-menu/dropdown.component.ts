import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { trigger, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  animations: [
    trigger('dropdownAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-8px)' }),
        animate('150ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('120ms ease-in', style({ opacity: 0, transform: 'translateY(-8px)' })),
      ]),
    ]),
  ],
})
export class DropdownComponent implements OnInit, OnChanges {
  //  Inputs 
  @Input() data: any[] = [];
  @Input() selectedValue: any = null;
  @Input() placeholder = 'Select option';
  @Input() displayField = 'name';
  @Input() valueField = 'id';
  @Input() icon = '';
  @Input() height = '56px';
  @Input() width = '100%';
  @Input() required = false;
  @Input() errorMessage = 'Это поле обязательно для заполнения';

  //  Outputs 
  @Output() selectionChange = new EventEmitter<any>();

  // State
  open = false;
  focused = false;
  touched = false;
  selectedItem: any = null;

  constructor(private eRef: ElementRef) {}

  // Initialize selected item if editing
  ngOnInit(): void {
    this.setSelectedFromValue();
  }

  // React to input or data changes
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedValue'] || changes['data']) {
      this.setSelectedFromValue();
    }
  }

  private setSelectedFromValue(): void {
    if (this.data?.length && this.selectedValue != null) {
      const match = this.data.find(
        (item) => item[this.valueField] === this.selectedValue
      );
      if (match) {
        this.selectedItem = match;
      }
    }
  }

  toggleDropdown(): void {
    this.open = !this.open;
    this.focused = this.open;
    this.touched = true;
  }

  selectItem(item: any): void {
    this.selectedItem = item;
    this.selectionChange.emit(item);
    this.open = false;
    this.focused = false;
  }

  reset(): void {
    this.selectedItem = null;
    this.touched = false;
    this.focused = false;
    this.open = false;
  }

  get isInvalid(): boolean {
    return this.required && this.touched && !this.selectedItem && this.open;
  }

  get borderColor(): string {
    if (this.isInvalid) return '#EF4444'; 
    if (this.focused) return '#008C79'; 
    return '#ECECED'; 
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.open = false;
      this.focused = false;
      this.touched = true;
    }
  }
}
