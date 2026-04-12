import { format } from 'date-fns';
import numeral from 'numeral';
import { CommonConfig, Entity, FieldSchema } from '../types';
import { FormSchema } from './../types/schema';

export function getEntityFieldDisplayValue(item: Entity, field: FieldSchema, config: CommonConfig) {
   const emptyValueText = config.entityEmptyValueText;
   switch (field.type) {
      case 'SELECT':
         const value = item[field.name!] as { displayValue?: string };
         if (field.isEnum) {
            return value?.displayValue ?? field.defaultValue ?? emptyValueText;
         } else {
            return value?.displayValue ?? field.defaultValue ?? emptyValueText;
         }

      case 'BOOLEAN': {
         const value = item[field.name!];
         const booleanOption = (field.options || []).find((item) => item.id === value);
         return booleanOption?.displayValue ?? (value === null ? emptyValueText : String(value));
      }

      case 'NUMBER': {
         const value = item[field.name!];
         if (value != null) {
            return field.format ? numeral(value).format(field.format) : value;
         } else {
            return field.defaultValue ?? emptyValueText;
         }
      }

      case 'DATE_TIME':
      case 'DATE': {
         const value = item[field.name!] ?? field.defaultValue;
         try {
            if (value && field.format) {
               const dateValue = new Date(String(value));
               return format(dateValue, field.format);
            }
         } catch (ex) {
            console.error(ex, value);
         }
         return value ?? emptyValueText;
      }

      case 'IMAGE':
         return item[field.name!] ?? field.defaultValue;

      case 'PHONE':
         return item[field.name!]
            ? config.phoneNumberDisplayValuePrefix + item[field.name!]
            : (field.defaultValue ?? emptyValueText);

      case 'EMAIL':
         return item[field.name!]
            ? config.emailDisplayValuePrefix + item[field.name!]
            : (field.defaultValue ?? emptyValueText);

      case 'TIME':
      default:
         return item[field.name!] ?? field.defaultValue ?? emptyValueText;
   }
}

export function getFieldSingleRawValue(item: Entity, field: FieldSchema) {
   if (field.multiline || field.isMarkdown || field.multi) {
      return undefined;
   }

   const value = item[field.name!];
   if (value == null) {
      return field.defaultValue ?? '';
   } else {
      return field.type === 'SELECT' ? (value as { id: number }).id : value;
   }
}

export function getEntityMultiFieldDisplayValues(
   item: Entity,
   field: FieldSchema,
   config: CommonConfig
): unknown[] {
   const value = item[field.name!];
   if (value == null) {
      return [];
   }
   if (!Array.isArray(value)) {
      console.error(`Multi field "${field.name}" expects array item data. entity:`, item);
      throw `Multi field "${field.name}" expects array item data. entity:`;
   }

   switch (field.type) {
      case 'TEXT':
      case 'PHONE':
      case 'EMAIL':
      case 'NUMBER':
         return value;

      default:
         return value.map((arrayItem) => getEntityFieldDisplayValue(arrayItem, field, config));
   }
}

export function getEntityFieldIconValue(item: Entity, field: FieldSchema) {
   if (field.options) {
      const value = item[field.name!];
      const option = field.options.find((item) => item.id === value);
      return option?.icon;
   }
   return null;
}

export function hasValue(item: Entity, field: FieldSchema) {
   return item[field.name!] !== null;
}

export function cloneSchema<T = FormSchema>(schema: FormSchema, newFields?: FieldSchema[]): T {
   const newSchema = {
      ...schema,
      fields:
         newFields ??
         [...(schema!.fields ?? [])].map((field) => ({
            ...field,
            options: field.options ? [...field.options] : field.options
         })),
      actions: [...(schema!.actions ?? [])].map((action) => ({ ...action }))
   } satisfies FormSchema as T;

   return newSchema;
}
