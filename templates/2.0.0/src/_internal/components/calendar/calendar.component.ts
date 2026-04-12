import {
   Component,
   EventEmitter,
   Input,
   OnChanges,
   OnInit,
   Output,
   SimpleChanges
} from '@angular/core';
import {
   add,
   differenceInMonths,
   format,
   isSameMonth,
   isSameWeek,
   isToday,
   startOfMonth,
   startOfWeek
} from 'date-fns';
import { ConfigService } from '../../services/config-service';

type Day = {
   day: number;
   date: Date;
   selected: boolean;
   selectedWeek: boolean;
   today: boolean;
   disabled: boolean;
};

@Component({
   selector: 'app-calendar',
   standalone: false,
   templateUrl: './calendar.component.html',
   styleUrl: './calendar.component.scss'
})
export class CalendarComponent implements OnInit, OnChanges {
   @Input() selectedDate?: string | null;
   @Input() isHidden!: boolean;
   @Input() format?: string;
   @Output() onSelect = new EventEmitter<string | null>();
   @Input() selectByWeek = false;

   constructor(private config: ConfigService) {}

   offset = 0; // month offset
   stage = 'day'; // day | month
   days: Day[] = [];
   firstVisibleYear = 0;
   selectedYear = 0;
   selectedMonth = 0;
   monthLabel = '';

   getMonths(offset: number) {
      return Array.from({ length: 6 }, (_, i) => format(new Date(2000, i + offset, 1), 'MMMM'));
   }

   get years() {
      return Array.from({ length: 5 }, (_, i) => this.firstVisibleYear + i);
   }

   ngOnInit() {
      this.generateCalendarDays();
   }

   ngOnChanges(changes: SimpleChanges): void {
      if (changes['selectedDate']) {
         this.navigateToDate(this.selectedDate ? new Date(this.selectedDate) : new Date());
      }

      if (changes['isHidden']) {
         this.stage = 'day';
      }
   }

   selectDay(day: Day) {
      this.days.forEach((d) => (d.selected = false));
      day.selected = true;
      this.selectedDate = format(day.date, this.format || this.config.value.dateFormat);
      this.onSelect.emit(this.selectedDate);
   }

   getCalendarStartingDay() {
      const date = new Date();
      const firstDayOfMonth = add(startOfMonth(date), {
         months: this.offset
      });
      const calendarFirstDay = startOfWeek(firstDayOfMonth, {
         weekStartsOn: this.config.value.weekStartDay
      });
      return { calendarFirstDay, firstDayOfMonth };
   }

   generateCalendarDays() {
      const { calendarFirstDay, firstDayOfMonth } = this.getCalendarStartingDay();
      this.days = [];

      for (let i = 0; i < 6 * 7; i++) {
         const date = add(calendarFirstDay, { days: i });
         const day: Day = {
            date,
            day: date.getDate(),
            disabled: !isSameMonth(date, firstDayOfMonth),
            selected:
               !this.selectByWeek &&
               this.selectedDate === format(date, this.format || this.config.value.dateFormat),
            selectedWeek:
               this.selectByWeek &&
               !!this.selectedDate &&
               isSameWeek(date, new Date(this.selectedDate), {
                  weekStartsOn: this.config.value.weekStartDay
               }),
            today: isToday(date)
         };
         this.days.push(day);
      }

      this.monthLabel = format(firstDayOfMonth, 'MMMM yyyy');
   }

   navigate(offset: number) {
      this.offset = offset;
      this.generateCalendarDays();
   }

   navigateToDate(date: Date | null) {
      this.changeStage('day');
      const offset = date ? differenceInMonths(startOfMonth(date), startOfMonth(new Date())) : 0;
      this.navigate(offset);
   }

   selectMonth(month: number) {
      const targetDate = new Date(this.selectedYear, month, 1);
      this.navigateToDate(targetDate);
   }

   changeStage(stage: 'day' | 'month') {
      this.stage = stage;

      if (stage === 'month') {
         const date = add(new Date(), { months: this.offset });
         this.selectedYear = date.getFullYear();
         this.selectedMonth = date.getMonth();
         this.firstVisibleYear = Math.floor(this.selectedYear / 5) * 5;
      }
   }

   isCurrentMonth(index: number) {
      return this.offset == 0 && index === new Date().getMonth();
   }

   moveYear(offset: number) {
      this.firstVisibleYear += offset;
   }

   selectYear(year: number) {
      this.selectedYear = year;
   }
}
