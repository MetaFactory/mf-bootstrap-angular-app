import { Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ConfigService } from '../services';
import type {
   Entity,
   EntityFilters,
   FieldSchema,
   FormSchema,
   FormSchemaDataTable,
   FormSchemaEntityPanel,
   SelectOption
} from '../types';
import { capitalize, upperFirst } from './lodash';

export function normalizeFieldsSchema(fields?: FieldSchema[]) {
   if (!fields) return [];

   const seenNames = new Set();
   for (const field of fields) {
      if (seenNames.has(field.name)) {
         console.error(`Warning: repeated property '${field.name}' is detected in the schema!`);
         continue;
      }
      seenNames.add(field.name);
   }

   return fields.map(normalizeFieldSchema);
}

export function normalizeDataTableFormSchema(
   schema: Partial<FormSchemaDataTable>
): FormSchemaDataTable {
   const actions = schema.actions || [];
   if (schema.canInsert) {
      actions.unshift({
         command: 'new-item',
         title: 'Create',
         icon: 'add',
         visibility: 'always'
      });
   }

   return {
      ...schema,
      onSelect: schema.onSelect ?? { command: 'view-item' },
      path: schema.path ?? schema.serviceName,
      actions,
      width: schema.width ?? 'auto',
      fields: normalizeFieldsSchema(schema.fields),
      filterFields: schema.filterFields ? normalizeFieldsSchema(schema.filterFields) : undefined,
      multiSelect: schema.multiSelect ?? false,
      type: 'data-table'
   };
}

export function normalizeEntityPanelSchema(
   schema: Partial<FormSchemaEntityPanel>
): FormSchemaEntityPanel {
   let actions = schema.actions || [];

   if (schema.canEdit === true) {
      if (!actions.some(({ command }) => command === 'edit-item')) {
         actions.unshift({
            command: 'edit-item',
            title: 'Edit',
            icon: 'edit_note',
            visibility: 'always'
         });
      }
   } else {
      actions = actions.filter(({ command }) => command !== 'edit-item');
   }

   if (schema.canDuplicate === true) {
      if (!actions.some(({ command }) => command === 'duplicate-item')) {
         actions.unshift({
            command: 'duplicate-item',
            icon: 'content_copy',
            visibility: 'always'
         });
      }
   } else {
      actions = actions.filter(({ command }) => command !== 'duplicate-item');
   }

   if (schema.canDelete === true) {
      if (!actions.some(({ command }) => command === 'delete-item')) {
         actions.unshift({
            command: 'delete-item',
            icon: 'delete',
            visibility: 'always'
         });
      }
   } else {
      actions = actions.filter(({ command }) => command !== 'delete-item');
   }

   return {
      ...schema,
      actions,
      type: 'entity-panel',
      path: schema.path ?? schema.serviceName + '/:id',
      viewTemplate: schema.viewTemplate ?? 'multi-tab',
      width: schema.width ?? 'sm',
      fields: normalizeFieldsSchema(schema.fields),
      sections: schema.sections ?? [],
      canDelete: schema.canDelete ?? false,
      canDuplicate: schema.canDuplicate ?? false,
      canEdit: schema.canEdit ?? false,
      onEntityPanelSchemaUpdate: schema.onEntityPanelSchemaUpdate ?? schema.onSchemaUpdate
   };
}

export function normalizeFreeFormSchema(schema: Partial<FormSchema>): FormSchema {
   return {
      ...schema,
      actions: schema.actions || [],
      type: 'free-form-modal',
      path: schema.path ?? schema.serviceName + '/:id',
      width: schema.width ?? 'sm',
      fields: normalizeFieldsSchema(schema.fields)
   };
}

export function normalizeFieldSchema(field: FieldSchema): FieldSchema {
   const name = field.name!;
   const title = upperFirst(name)
      .replace(/([A-Z])/g, ' $1')
      .trim();

   const defaults = {
      name,
      title,
      type: 'TEXT',
      sortable: true,
      required: false,
      multi: false,
      isEnum: false,
      viewState: 'visible',
      editState: 'visible',
      insertState: field.editState ?? 'visible',
      sortParamName: field.sortParamName ?? name
   } satisfies FieldSchema;

   switch (field.type) {
      case 'BOOLEAN':
         const defaultOptions: SelectOption[] = [
            { id: true, icon: 'check_box', displayValue: 'YES' },
            { id: false, icon: 'check_box_outline_blank', displayValue: 'NO' }
         ];

         if (!field.required) {
            defaultOptions.push({ id: null, displayValue: '-' });
         }

         field.options = field.options ?? defaultOptions;
         break;
   }

   return { ...defaults, ...field };
}

export function normalizeFiltersFields(
   filterFields: FieldSchema[],
   schema: EntityFilters,
   translator: TranslateService,
   config: ConfigService
) {
   for (const key in schema) {
      const [, name] = key.split('.');
      const field = filterFields.find((f) => f.name === name);
      if (field) {
         schema[key].type = field.type!; // Prevent type to be overwritten
         Object.assign(field, schema[key]);

         if (schema[key].options) {
            // use schema options from Schema or overwrite it with values coming from filters api
            field.options = schema[key].options.map((option) => ({
               ...option,
               displayValue:
                  option.displayValue || translator?.instant(option.translateString || '-')
            }));
         }
      }
   }
}

export function normalizeDataList<T>(
   data: T[],
   fields: FieldSchema[],
   translator: TranslateService
) {
   return data.map((item) => normalizeSelectFieldsEntity<T>(fields, item, translator));
}

export function pickFieldsValues(fields: FieldSchema[], item: any): any {
   const res: Record<string, unknown> = {};
   for (const field of fields) {
      if (item && item[field.name!] != null) {
         res[field.name!] = item[field.name!];
      }
   }
   return res;
}

export function mapFieldsSchemaToFormGroup(fields: FieldSchema[]) {
   const formGroup: Record<string, unknown> = {};

   for (const field of fields) {
      const validators: Validators[] = [];
      if (field.required) validators.push(Validators.required);
      if (field.pattern) validators.push(Validators.pattern(field.pattern));

      formGroup[field.name!] = [field.defaultValue, validators];
   }
   return formGroup;
}

export function cloneSchemaFields(immutableFields: FieldSchema[]) {
   return [...immutableFields.map((field) => ({ ...field }))];
}

export function normalizeEntity<T>(
   fields: FieldSchema[],
   item: Entity,
   translator: TranslateService
): T {
   const res = { ...item } as Record<string, unknown>;

   for (const field of fields ?? []) {
      if (field.type === 'SELECT') {
         if (field.isEnum) {
            const value = res[field.name!];
            if (value) {
               const displayValue = translator?.instant(capitalize(field.name) + '.' + value);
               if (!displayValue) {
                  console.warn(
                     `Translation for key "${capitalize(field.name)}.${value}" not found`
                  );
               }
               res[field.name!] = {
                  id: value,
                  displayValue
               };
            }
         } else {
            const propertyName = 'selected' + capitalize(field.name!);
            const value = res[propertyName];
            res[field.name!] = value;

            // clean the extra fields
            delete res[propertyName];
         }
         delete res[field.name + 'List'];
      }
   }

   return res as T;
}

export function normalizeSelectFieldsEntity<T = Record<string, unknown>>(
   fields: FieldSchema[],
   item: T,
   translator: TranslateService
): T {
   const res = { ...item } as Record<string, unknown>;

   fields
      .filter((field) => field.type === 'SELECT')
      .forEach((field) => {
         if (field.isEnum) {
            const displayValueKey = res[field.name + 'DisplayValue'] as string;
            const displayValue = displayValueKey ? translator?.instant(displayValueKey) : '-';
            const value = res[field.name!];
            res[field.name!] = value != null ? { id: value, displayValue } : null;
         } else {
            const displayValue = res[field.name + 'DisplayValue'];
            const id = res[field.name + 'PkId'];
            res[field.name!] = id != null ? { id, displayValue } : null;

            // Cleanup
            delete res[field.name + 'PkId'];
         }
         // Cleanup
         delete res[field.name + 'DisplayValue'];
      });

   return res as T;
}

export function getFieldTitle(field: FieldSchema, translator: TranslateService): string {
   return field.translationBase ? translator.instant(field.translationBase) : (field.title ?? '');
}

export function validateAndNormalizeEditDto<EDIT>(data: EDIT, fields: FieldSchema[]): EDIT {
   const res = { ...data } as Record<string, unknown>;
   const isInsertMode = res['id'] == null;
   const visibleFields = fields.filter(
      (field) =>
         (isInsertMode && field.insertState != 'hidden') ||
         (!isInsertMode && field.editState != 'hidden')
   );
   for (const field of visibleFields) {
      const value = res[field.name!];
      if (value === undefined) {
         throw new Error(
            `Configuration problem: Field '${field.name}' is required. Make sure you have configured the field '${field.name}' in current schema in a proper way!`
         );
      }

      switch (field.type) {
         case 'SELECT':
            if (field.isEnum) {
               if (value) {
                  res[field.name!] = (value as SelectOption).id;
               }
            } else {
               res['selected' + capitalize(field.name)] = value;
               delete res[field.name!];
            }
            break;
      }
   }
   return res as EDIT;
}
