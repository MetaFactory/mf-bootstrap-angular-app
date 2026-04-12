import {
   Component,
   EventEmitter,
   Input,
   OnChanges,
   Output,
   SimpleChanges,
   forwardRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { add, addMonths, differenceInWeeks, format, startOfDay, startOfWeek } from 'date-fns';
import { ConfigService } from '../../services';

@Component({
   selector: 'app-month-selector',
   standalone: false,
   templateUrl: './month-selector.component.html',
   styleUrl: './month-selector.component.css',
   providers: [
      {
         provide: NG_VALUE_ACCESSOR,
         useExisting: forwardRef(() => MonthSelectorComponent),
         multi: true
      }
   ]
})
export class MonthSelectorComponent implements ControlValueAccessor, OnChanges {
   @Input() offset = 0;
   @Input() name?: string;
   @Output() change = new EventEmitter<number>();

   constructor(private config: ConfigService) {}

   isCalendarVisible = false;
   value: number = 0;

   onChange: any = (value: number) => {
      this.change.emit(value);
   };

   ngOnChanges(changes: SimpleChanges): void {
      if (changes['offset']) {
         this.value = this.offset;
      }
   }

   get selectedDate() {
      return format(add(new Date(), { weeks: this.offset }), this.config.value.dateFormat);
   }

   setValue(value: any): void {
      this.value = value;
      this.onChange(value);
   }

   writeValue(value: any): void {
      this.setValue(value);
   }

   registerOnChange(fn: any): void {
      this.onChange = fn;
   }

   registerOnTouched(fn: any): void {
      //
   }

   toggleCalendar(show: boolean) {
      this.isCalendarVisible = show;
   }

   handleSelectDate(date: string | null) {
      setTimeout(() => this.toggleCalendar(false), 100);
      if (date) {
         const offset = differenceInWeeks(new Date(date), new Date());
         this.change.emit(offset);
      }
   }

   get caption() {
      const startDate = addMonths(new Date(), this.value ?? 0);
      if (startDate.getFullYear() == new Date().getFullYear()) {
         // Same year
         return format(startDate, 'MMMM');
      } else {
         return format(startDate, 'MMMM yyyy');
      }
   }

   getStartDate() {
      return addMonths(
         startOfWeek(startOfDay(new Date()), { weekStartsOn: this.config.value.weekStartDay }),
         this.value ?? 0
      );
   }
}
