import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { FieldSchema } from '../../../types';
import { getFieldTitle } from '../../../utils';

@Component({
   selector: 'app-entity-field-edit',
   standalone: false,
   templateUrl: './entity-field-edit.component.html',
   styleUrl: './entity-field-edit.component.scss'
})
export class EntityFieldEditComponent {
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

   constructor(private translator: TranslateService) {}

   onFileSelect(ev: any, field: FieldSchema): void {
      if (ev.target.files.length > 0) {
         const file = ev.target.files[0];
         this.formGroup.patchValue({
            [field.name!]: file
         });
         this.formGroup.get(field.name!)!.updateValueAndValidity();
      }
   }

   getFieldTitle(field: FieldSchema) {
      return getFieldTitle(field, this.translator);
   }
}
