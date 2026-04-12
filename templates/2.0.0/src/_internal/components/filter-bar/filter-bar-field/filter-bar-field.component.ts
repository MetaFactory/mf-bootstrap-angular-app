import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldSchema } from '../../../types';

@Component({
   selector: 'app-filter-bar-field',
   standalone: false,
   templateUrl: './filter-bar-field.component.html',
   styleUrl: './filter-bar-field.component.scss'
})
export class FilterBarFieldComponent {
   @Input() field!: FieldSchema;
   @Input() formGroup!: FormGroup;
   @Output() onOptionsSearch = new EventEmitter<string>();

   /**
    * Whether the component is in an error state
    */
   @Input() hasError: boolean = false;

   /**
    * Error message to display when in error state
    */
   @Input() errorText: string = 'Something went wrong';
}
