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

@Component({
   selector: 'app-input-text',
   standalone: false,
   templateUrl: './input-text.component.html',
   styleUrl: './input-text.component.scss',
   providers: [
      {
         provide: NG_VALUE_ACCESSOR,
         useExisting: forwardRef(() => InputTextComponent),
         multi: true
      }
   ]
})
export class InputTextComponent implements ControlValueAccessor, OnChanges {
   @Input() placeholder?: string;
   @Input() name?: string;
   @Input() type?: string;
   @Input() defaultValue: string = '';
   value: string = '';
   @Output() change = new EventEmitter<string | null>();

   ngOnChanges(changes: SimpleChanges): void {
      if (changes['defaultValue']) {
         this.setValue(this.defaultValue);
      }
   }

   get hasValue() {
      return !!this.value;
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
   setDisabledState?(isDisabled: boolean): void {
      //
   }

   onChange(value: string) {
      this.change.emit(value);
   }

   resetValues(ev: MouseEvent) {
      ev.stopPropagation();
      this.setValue('');
   }

   blurInput(ev: FocusEvent | Event) {
      const input = ev.target as HTMLInputElement;
      this.setValue(input.value);
   }
}
