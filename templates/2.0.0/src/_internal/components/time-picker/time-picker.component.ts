import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
   selector: 'app-time-picker',
   standalone: false,
   templateUrl: './time-picker.component.html',
   styleUrl: './time-picker.component.scss'
})
export class TimePickerComponent implements OnChanges {
   @Input() selectedTime?: string | null;
   @Output() onSelect = new EventEmitter<string | null>();

   hours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
   isAm = true;
   selectedHour = 0;
   selectedMinute = 0;

   ngOnChanges(changes: SimpleChanges): void {
      if (changes['selectedTime']) {
         this.extractSelectedHourAndMinute();
      }
   }

   extractSelectedHourAndMinute() {
      if (this.selectedTime && /^\d{1,2}:\d{1,2}$/.test(this.selectedTime)) {
         const [hour, minute] = this.selectedTime.split(':');

         this.isAm = +hour < 12;
         this.selectedHour = +hour % 12;

         if (+minute % 5 !== 0) {
            this.selectedMinute = -1; // Don't select any minute
         } else {
            this.selectedMinute = +minute / 5;
         }
      } else {
         this.selectedHour = 0;
         this.selectedMinute = 0;
      }
   }

   toggleAmPm() {
      this.isAm = !this.isAm;
   }

   selectHour(value: number) {
      this.selectedHour = value;
   }

   selectMinute(value: number) {
      this.selectedMinute = value;
      const hour = this.selectedHour + (this.isAm ? 0 : 12);
      const minute = this.selectedMinute * 5;
      const time = hour.toString().padStart(2, '0') + ':' + minute.toString().padStart(2, '0');
      this.onSelect.emit(time);
   }
}
