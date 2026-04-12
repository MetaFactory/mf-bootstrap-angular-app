import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import isEqual from 'lodash.isequal';
import uniq from 'lodash.uniq';
import markdownit from 'markdown-it';
import { ConfigService } from '../../services';
import { ApiService } from '../../services/api.service';
import { FieldSchema, FormActionState, SelectFieldOptionsSearch } from '../../types';
import { getEntityFieldDisplayValue, getFieldTitle, mapFieldsSchemaToFormGroup } from '../../utils';

@Component({
   selector: 'app-entity-edit-panel',
   standalone: false,
   templateUrl: './entity-edit-panel.component.html',
   styleUrl: './entity-edit-panel.component.scss'
})
export class EntityEditPanelComponent implements OnChanges {
   @Input() public entity: any;
   @Input() public fields!: FieldSchema[];
   @Input() public formActionState: FormActionState = 'Idle';
   @Input() public title = '';
   @Output() public onChange = new EventEmitter<any>();
   @Output() onCancel = new EventEmitter<boolean>();
   @Output() onSave = new EventEmitter<any>();
   public groupedFields: { name: string; fields: FieldSchema[] }[] = [];
   form!: FormGroup;
   extraData: any = {};

   fieldHasError: Record<string, boolean> = {};
   fieldErrorText: Record<string, string> = {};

   constructor(
      private fb: FormBuilder,
      private service: ApiService,
      private config: ConfigService,
      private translator: TranslateService
   ) {}

   ngOnChanges(changes: SimpleChanges): void {
      if (changes['entity']) {
         this.instantiateForm();
         if (this.entity && !isEqual(this.form.value, this.entity)) {
            this.updateExtraData(this.entity);
            this.form.patchValue(this.entity, { emitEvent: false });
         }
      }

      if (changes['fields']) {
         const groups = uniq(this.visibleFields.map(({ group }) => group || ''));
         this.groupedFields = groups.map((group) => ({
            name: group,
            fields: this.visibleFields.filter((field) => (field.group || '') === (group || ''))
         }));

         this.fields.forEach((field) => {
            this.fieldHasError[field.name!] = false;
            this.fieldErrorText[field.name!] = '';
         });
      }
   }

   get visibleFields() {
      return this.fields.filter((field) =>
         this.isNew ? field.insertState !== 'hidden' : field.editState !== 'hidden'
      );
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
      }
   }

   save() {
      const newValue = { ...this.form.value, ...this.extraData };
      this.onSave.emit(newValue);
   }

   ngOnInit(): void {
      this.instantiateForm();
   }

   trackByFn = (_: number, item: FieldSchema) => item.name;

   get isNew() {
      return !this.entity?.id;
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

   getFieldDescription(field: FieldSchema) {
      if (!field.description) return '';

      const md = markdownit();
      return md.render(field.description);
   }

   getDisplayValue(field: FieldSchema) {
      if (!this.entity) {
         return this.config.value.entityEmptyValueText;
      }
      return getEntityFieldDisplayValue(this.entity, field, this.config.value);
   }

   getFieldTitle(field: FieldSchema) {
      return getFieldTitle(field, this.translator);
   }
}
