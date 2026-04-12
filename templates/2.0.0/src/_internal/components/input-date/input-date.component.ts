import {
   Component,
   ElementRef,
   EventEmitter,
   Input,
   OnChanges,
   Output,
   Renderer2,
   SimpleChanges,
   ViewChild,
   forwardRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { format, isValid, parse } from 'date-fns';
import { ConfigService } from '../../services';

@Component({
   selector: 'app-input-date',
   standalone: false,
   templateUrl: './input-date.component.html',
   providers: [
      {
         provide: NG_VALUE_ACCESSOR,
         useExisting: forwardRef(() => InputDateComponent),
         multi: true
      }
   ],
   styleUrl: './input-date.component.scss'
})
export class InputDateComponent implements ControlValueAccessor, OnChanges {
   @Input() placeholder?: string;
   @Input() resetButton: boolean = false;
   @Input() selectedDate: string | null = null;
   @Input() hasTime = false;
   @Input() name?: string;
   @Output() change = new EventEmitter<string | null>();
   onTouched: any = () => {};
   isCalendarVisible = false;
   isDisabled = false;
   inputRect?: DOMRect;
   @ViewChild('inputRef') inputRef!: ElementRef<HTMLButtonElement>;
   times: string[] = [];
   timeValue = '00:00';
   value: string | null = null;

   constructor(
      private el: ElementRef,
      private renderer: Renderer2,
      public config: ConfigService
   ) {
      this.generateHalfHourTimes();
   }

   ngOnChanges(changes: SimpleChanges): void {
      if (changes['name'] && this.name) {
         this.renderer.setAttribute(this.el.nativeElement, 'data-name', this.name); // Used as selector for testing and styling
      }

      if (changes['selectedDate']) {
         this.value = this.selectedDate;
      }
   }

   onChange(value: string) {
      this.change.emit(value);
      if (value) {
         this.timeValue = value ? format(new Date(value), 'HH:mm') : '';
      }
   }

   generateHalfHourTimes() {
      for (let hour = 0; hour < 24; hour += 0.5) {
         this.times.push(
            `${String(Math.floor(hour)).padStart(2, '0')}:${hour % 1.0 ? '30' : '00'}`
         );
      }
   }

   setValue(value: any): void {
      this.value = value;
      if (this.hasTime && value) {
         this.value =
            format(new Date(value), 'yyyy-MM-dd') +
            'T' +
            (this.timeValue || '00:00') +
            ':00' +
            format(new Date(), 'XXX');
      }

      this.onChange(this.value!);
   }

   writeValue(value: any): void {
      this.timeValue = value ? format(new Date(value), 'HH:mm') : '';
      this.setValue(value);
   }

   registerOnChange(fn: any): void {
      this.onChange = fn;
   }

   registerOnTouched(fn: any): void {
      //
   }

   get dateValue() {
      return this.value ? format(new Date(this.value), 'yyyy-MM-dd') : '';
   }

   get hasValue() {
      return !!this.value;
   }

   setDisabledState(isDisabled: boolean) {
      this.isDisabled = isDisabled;
   }

   handleSelect(value: string | null) {
      this.setValue(value);
      setTimeout(() => this.toggleCalendar(false), 200);
   }

   toggleCalendar(show: boolean) {
      this.inputRect = this.inputRef.nativeElement.getBoundingClientRect();
      this.isCalendarVisible = show;
   }

   resetValues(ev: MouseEvent) {
      ev.stopPropagation();
      this.setValue(null);
   }

   blurDateInput(ev: FocusEvent | Event) {
      const input = ev.target as HTMLInputElement;
      this.parseDate(input, input.value);
   }

   parseDate(input: HTMLInputElement, value: string) {
      const theDate = parse(value, this.config.value.dateFormat, new Date());
      if (isValid(theDate)) {
         input.value = format(theDate, this.config.value.dateFormat);
         this.setValue(input.value);
      } else {
         input.value = this.value || '';
      }
   }

   handleEnter(ev: Event) {
      const input = ev.target as HTMLInputElement;
      this.parseDate(input, input.value);
      this.isCalendarVisible = false;
      ev.preventDefault();
   }

   timeChanged(ev: Event) {
      const selectElement = ev.target as HTMLSelectElement;
      this.timeValue = selectElement.value;
      this.setValue(this.value);
   }
}
