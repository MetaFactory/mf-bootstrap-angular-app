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
import { ConfigService } from '../../services';

@Component({
   selector: 'app-input-time',
   standalone: false,
   templateUrl: './input-time.component.html',
   providers: [
      {
         provide: NG_VALUE_ACCESSOR,
         useExisting: forwardRef(() => InputTimeComponent),
         multi: true
      }
   ],
   styleUrl: './input-time.component.scss'
})
export class InputTimeComponent implements ControlValueAccessor, OnChanges {
   @Input() placeholder?: string;
   @Input() resetButton: boolean = false;
   @Input() selectedTime: string | null = null;
   @Input() name?: string;
   @Output() change = new EventEmitter<string | null>();
   onTouched: any = () => {};
   isTimePickerVisible = false;
   isDisabled = false;
   inputRect?: DOMRect;
   @ViewChild('inputRef') inputRef!: ElementRef<HTMLButtonElement>;
   value: string | null = null;

   constructor(
      private el: ElementRef,
      private renderer: Renderer2,
      public config: ConfigService
   ) {}

   ngOnChanges(changes: SimpleChanges): void {
      if (changes['name'] && this.name) {
         this.renderer.setAttribute(this.el.nativeElement, 'data-name', this.name); // Used as selector for testing and styling
      }

      if (changes['selectedTime']) {
         this.value = this.selectedTime;
      }
   }

   onChange(value: string) {
      this.change.emit(value);
   }

   setValue(value: any): void {
      this.value = value;
      this.onChange(this.value!);
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

   get hasValue() {
      return !!this.value;
   }

   setDisabledState(isDisabled: boolean) {
      this.isDisabled = isDisabled;
   }

   handleSelect(value: string | null) {
      this.setValue(value);
      setTimeout(() => this.toggleTimePicker(false), 200);
   }

   toggleTimePicker(show: boolean) {
      this.inputRect = this.inputRef.nativeElement.getBoundingClientRect();
      this.isTimePickerVisible = show;
   }

   resetValues(ev: MouseEvent) {
      ev.stopPropagation();
      this.setValue(null);
   }

   blurDateInput(ev: FocusEvent | Event) {
      const input = ev.target as HTMLInputElement;
      this.setValue(input.value);
   }

   handleEnter(ev: Event) {
      const input = ev.target as HTMLInputElement;
      this.setValue(input.value);
      this.isTimePickerVisible = false;
      ev.preventDefault();
   }
}
