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
import {
   add,
   addDays,
   addWeeks,
   differenceInWeeks,
   format,
   startOfDay,
   startOfWeek
} from 'date-fns';
import { ConfigService } from '../../services/config-service';

@Component({
   selector: 'app-week-selector',
   standalone: false,
   templateUrl: './week-selector.component.html',
   styleUrl: './week-selector.component.css',
   providers: [
      {
         provide: NG_VALUE_ACCESSOR,
         useExisting: forwardRef(() => WeekSelectorComponent),
         multi: true
      }
   ]
})
export class WeekSelectorComponent implements ControlValueAccessor, OnChanges {
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
         const selectDateStartOfWeek = startOfWeek(new Date(date), {
            weekStartsOn: this.config.value.weekStartDay
         });
         const nowStartOfWeek = startOfWeek(new Date(), {
            weekStartsOn: this.config.value.weekStartDay
         });

         const offset = differenceInWeeks(selectDateStartOfWeek, nowStartOfWeek);
         this.change.emit(offset);
      }
   }

   get selectedWeekCaption() {
      const startDate = this.getStartDate();
      if (startDate.getMonth() == addDays(startDate, 6).getMonth()) {
         // Same month
         return `${format(startDate, 'MMM')} ${format(startDate, 'd')} - ${format(
            addDays(startDate, 6),
            'd'
         )}`;
      } else {
         return `${format(startDate, 'MMM d')} - ${format(addDays(startDate, 6), 'MMM d')}`;
      }
   }

   getStartDate() {
      return addWeeks(
         startOfWeek(startOfDay(new Date()), { weekStartsOn: this.config.value.weekStartDay }),
         this.value ?? 0
      );
   }
}
