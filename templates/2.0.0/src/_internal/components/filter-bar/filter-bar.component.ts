import {
   Component,
   ElementRef,
   EventEmitter,
   Input,
   OnChanges,
   Output,
   SimpleChanges,
   ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { FieldSchema, SelectFieldOptionsSearch } from '../../types';
import { mapFieldsSchemaToFormGroup, pickFieldsValues } from '../../utils';

@Component({
   selector: 'app-filter-bar',
   standalone: false,
   templateUrl: './filter-bar.component.html',
   styleUrl: './filter-bar.component.scss'
})
export class FilterBarComponent implements OnChanges {
   @Input() public defaultValue!: any;
   @Input() public fields!: FieldSchema[];
   @Input() public debounceDelay = 200; // ms;
   @Output() public onChange = new EventEmitter<any>();
   @ViewChild('formContainer', { static: true }) formContainer!: ElementRef;
   form!: FormGroup;

   fieldHasError: Record<string, boolean> = {};
   fieldErrorText: Record<string, string> = {};

   constructor(
      private fb: FormBuilder,
      private service: ApiService
   ) {}

   ngOnInit(): void {
      if (!this.fields) throw "Required property: 'fields'";

      this.form = this.fb.group(mapFieldsSchemaToFormGroup(this.fields));
      this.form.valueChanges
         .pipe(debounceTime(this.debounceDelay))
         .subscribe(() => this.onChange.emit(this.form.value));
      const value = pickFieldsValues(this.fields, this.defaultValue);
      this.form.patchValue(value);
   }

   ngOnChanges(changes: SimpleChanges): void {
      if (changes['fields']) {
         this.fields.forEach((field) => {
            this.fieldHasError[field.name!] = false;
            this.fieldErrorText[field.name!] = '';
         });
      }
   }

   async handleOptionsSearch(ev: SelectFieldOptionsSearch) {
      const fieldName = ev.field.name!;

      try {
         this.fieldHasError[fieldName] = false;
         this.fieldErrorText[fieldName] = '';

         const res = await this.service.filterListOptions(
            ev.field.autocomplete!.url!,
            ev.field.autocomplete!.paramName,
            ev.search
         );
         const field = this.fields.find((field) => field.name === fieldName)!;
         field.options = res;
      } catch (ex) {
         this.fieldHasError[fieldName] = true;
         this.fieldErrorText[fieldName] = 'Error loading options';
      }
   }

   trackByFn = (_: number, item: FieldSchema) => item.name;
}
