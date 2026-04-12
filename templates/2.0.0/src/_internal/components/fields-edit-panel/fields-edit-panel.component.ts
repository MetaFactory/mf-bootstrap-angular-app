import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import isEqual from 'lodash.isequal';
import markdownit from 'markdown-it';
import { ConfigService } from '../../services';
import { ApiService } from '../../services/api.service';
import { Entity, FieldSchema, FieldsQuery, SelectFieldOptionsSearch } from '../../types';
import { getEntityFieldDisplayValue, getFieldTitle, mapFieldsSchemaToFormGroup } from '../../utils';

@Component({
   selector: 'app-fields-edit-panel',
   standalone: false,
   templateUrl: './fields-edit-panel.component.html',
   styleUrl: './fields-edit-panel.component.scss'
})
export class FieldsEditPanelComponent implements OnChanges {
   @Input() public data: unknown;
   @Input() public fields!: FieldSchema[];
   @Output() public onChange = new EventEmitter<unknown>();
   @Output() formValidity = new EventEmitter<boolean>();

   form!: FormGroup;
   extraData: any = {};

   constructor(
      private fb: FormBuilder,
      private service: ApiService,
      private config: ConfigService,
      private translator: TranslateService
   ) {}

   ngOnChanges(changes: SimpleChanges): void {
      if (changes['data']) {
         this.instantiateForm();
         if (this.data && !isEqual(this.form.value, this.data)) {
            this.updateExtraData(this.data);
            this.form.patchValue(this.data, { emitEvent: false });
         }
      }
   }

   updateExtraData(entity: any) {
      // Update extraData with properties from entity that are not in the form
      const formControlNames = Object.keys(this.form.controls);
      this.extraData = Object.keys(entity)
         .filter((key) => !formControlNames.includes(key))
         .reduce((obj, key) => ({ ...obj, [key]: entity[key] }), {});
   }

   instantiateForm() {
      if (!this.form) {
         this.form = this.fb.group(mapFieldsSchemaToFormGroup(this.fields));
         this.form.valueChanges.subscribe(() => {
            this.onChange.emit({ ...this.form.value, ...this.extraData });
         });

         this.form.statusChanges.subscribe(() => {
            this.formValidity.emit(this.form.valid);
         });
      }
   }

   ngOnInit(): void {
      this.instantiateForm();
   }

   trackByFn = (_: number, item: FieldSchema) => item.name;

   async handleOptionsSearch(ev: SelectFieldOptionsSearch) {
      const res = await this.service.filterListOptions(
         ev.field.autocomplete!.url!,
         ev.field.autocomplete!.paramName,
         ev.search
      );
      const field = this.fields.find((field) => field.name === ev.field.name)!;
      field.options = res;
   }

   getFieldDescription(field: FieldSchema) {
      if (!field.description) return '';

      const md = markdownit();
      return md.render(field.description);
   }

   isFieldHidden(field: FieldSchema) {
      if (field.visibleOn && this.form) {
         return !this.evaluateVisibility(field.visibleOn);
      }
      return false;
   }

   evaluateVisibility(query: FieldsQuery): boolean {
      let fieldValue = this.form.value[query.field];
      const field = this.fields.find((field) => field.name == query.field);
      if (!field) {
         throw `evaluateVisibility failed. field '${query.field}' does not exist in fields list.`;
      }
      if (field.type === 'SELECT' && fieldValue) {
         fieldValue = fieldValue.id;
      }
      const targetValue = query.value;

      switch (query.operator) {
         case 'eq':
            return fieldValue === targetValue;
         case 'neq':
            return fieldValue !== targetValue;
         case 'gt':
            return fieldValue > Number(targetValue);
         case 'gte':
            return fieldValue >= Number(targetValue);
         case 'lt':
            return fieldValue < Number(targetValue);
         case 'lte':
            return fieldValue <= Number(targetValue);
         case 'in':
            return Array.isArray(targetValue) && targetValue.includes(fieldValue);
         case 'nin':
            return Array.isArray(targetValue) && !targetValue.includes(fieldValue);
         case 'like':
            return (
               typeof fieldValue === 'string' && new RegExp(String(targetValue)).test(fieldValue)
            );
         case 'nlike':
            return (
               typeof fieldValue === 'string' && !new RegExp(String(targetValue)).test(fieldValue)
            );
         case 'between':
            return (
               Array.isArray(targetValue) &&
               fieldValue >= targetValue[0] &&
               fieldValue <= targetValue[1]
            );
         case 'nbetween':
            return (
               Array.isArray(targetValue) &&
               (fieldValue < targetValue[0] || fieldValue > targetValue[1])
            );
         case 'nn':
            return fieldValue != null;

         case 'nl':
            return fieldValue == null;

         default:
            return true; // If the operator is unknown, default to visible
      }
   }

   getDisplayValue(field: FieldSchema) {
      return getEntityFieldDisplayValue(this.data as Entity, field, this.config.value);
   }

   getFieldTitle(field: FieldSchema) {
      return getFieldTitle(field, this.translator);
   }
}
