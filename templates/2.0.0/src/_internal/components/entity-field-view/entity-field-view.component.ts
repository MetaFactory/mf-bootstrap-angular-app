import { Component, Injector, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ConfigService } from '../../services';
import { Entity, FieldSchema } from '../../types';
import {
   getEntityFieldDisplayValue,
   getEntityFieldIconValue,
   getEntityMultiFieldDisplayValues,
   processTemplate
} from '../../utils';

@Component({
   selector: 'app-entity-field-view',
   standalone: false,
   templateUrl: './entity-field-view.component.html',
   styleUrl: './entity-field-view.component.scss'
})
export class EntityFieldViewComponent {
   @Input() field!: FieldSchema;
   @Input() record!: unknown;

   constructor(
      private config: ConfigService,
      private sanitizer: DomSanitizer,
      public injector: Injector
   ) {}

   getFieldDisplayValue(item: any, field: FieldSchema) {
      return getEntityFieldDisplayValue(item, field, this.config.value) as string;
   }

   isLink(item: any, field: FieldSchema) {
      if (field.type === 'EMAIL' || field.type === 'PHONE') {
         return !!item[field.name!];
      } else if (field.url) {
         const value =
            field.type === 'SELECT' ? item[field.name!]?.displayValue : item[field.name!];
         return (value ?? field.defaultValue) != null;
      } else {
         return false;
      }
   }

   getJsonFieldHtmlContent(item: any, field: FieldSchema) {
      const value = item[field.name!];
      if (!value) return '';

      if (Array.isArray(value)) {
         let htmlContent = `<div data-field-name="${field.name}" class="json_array">`;

         value.forEach((item) => {
            htmlContent += "<div class='json_element'>";
            Object.entries(item).forEach(([key, value]) => {
               htmlContent += `<div data-attr-name="${key}" class="json_attr">${value ?? ''}</div>`;
            });
            htmlContent += '</div>';
         });

         htmlContent += '</div>';
         return this.sanitizer.bypassSecurityTrustHtml(htmlContent); // prevents removing unsafe attributes e.g. "data-attr-name"
      } else {
         return this.jsonElementToHtml(value);
      }
   }

   getLinkValue(item: unknown, field: FieldSchema) {
      switch (field.type) {
         case 'PHONE':
            const phone = (item as any)[field.name!];
            return `tel: ${phone}`;

         case 'EMAIL':
            const email = (item as any)[field.name!];
            return `mailto: ${email}`;

         default:
            return processTemplate(field.url!, item);
      }
   }

   getLinkTarget(record: any, field: FieldSchema) {
      return this.isExternalLink(record, field) ? '_blank' : '_self';
   }

   isExternalLink(record: any, field: FieldSchema) {
      if (
         field.type === 'EMAIL' ||
         field.type === 'PHONE' ||
         field.url?.startsWith('http') ||
         field.url?.startsWith('mailto:') ||
         field.url?.startsWith('tel:')
      ) {
         return true;
      } else {
         const url = this.getFieldDisplayValue(record, field);
         return url.startsWith('http');
      }
   }

   getLinkIcon(field: FieldSchema) {
      if (field.type === 'EMAIL' || field.url?.startsWith('mailto:')) {
         return 'mail';
      } else if (field.type === 'PHONE' || field.url?.startsWith('tel:')) {
         return 'call';
      } else if (field.url?.startsWith('https://www.google.com/maps/')) {
         return 'location_on';
      } else {
         return 'open_in_new';
      }
   }

   handleLinkClick(ev: MouseEvent, item: any, field: FieldSchema) {
      if (field.onUrlClick) {
         ev.preventDefault();
         field.onUrlClick({ record: this.record as Entity, injector: this.injector });
      }

      if (this.isLink(item, field)) {
         ev.stopPropagation();
      }
   }

   jsonElementToHtml(record: any) {
      let htmlContent = "<div class='json_element'>";
      Object.entries(record).forEach(([key, value]) => {
         htmlContent += `<div class='json_attr' data-attr-name='${key}'>${value}</div>`;
      });
      return '</div>';
   }

   getEntityMultiFieldDisplayValues(item: any, field: FieldSchema) {
      return getEntityMultiFieldDisplayValues(item, field, this.config.value);
   }

   getFieldIconValue(item: any, field: FieldSchema) {
      return getEntityFieldIconValue(item, field);
   }
}
