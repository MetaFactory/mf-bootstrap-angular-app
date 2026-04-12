import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
   selector: 'app-checkbox',
   standalone: false,
   templateUrl: './checkbox.component.html',
   styleUrl: './checkbox.component.scss',
   providers: [
      {
         provide: NG_VALUE_ACCESSOR,
         useExisting: forwardRef(() => CheckboxComponent),
         multi: true
      }
   ]
})
export class CheckboxComponent implements ControlValueAccessor {
   @Input() label: string = '';
   @Input() name?: string;
   value: boolean = false;

   onChange(value: boolean) {
      //
   }

   setValue(value: boolean, ev?: MouseEvent) {
      if (ev) {
         ev.preventDefault();
      }
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
}
