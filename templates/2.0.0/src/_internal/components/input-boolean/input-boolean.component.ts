import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
   selector: 'app-input-boolean',
   standalone: false,
   templateUrl: './input-boolean.component.html',
   styleUrl: './input-boolean.component.scss',
   providers: [
      {
         provide: NG_VALUE_ACCESSOR,
         useExisting: forwardRef(() => InputBooleanComponent),
         multi: true
      }
   ]
})
export class InputBooleanComponent implements ControlValueAccessor {
   @Input() nullable = true;
   @Input() id?: string;
   value: boolean | null = null;

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

   onChange(value: boolean) {
      //
   }

   registerOnTouched(fn: any): void {
      //
   }

   setDisabledState?(isDisabled: boolean): void {
      //
   }
}
