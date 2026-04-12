import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import uniq from 'lodash.uniq';
import markdownit from 'markdown-it';
import { FieldSchema } from '../../../types';
import { getFieldTitle } from '../../../utils';

@Component({
   selector: 'app-entity-view',
   standalone: false,
   templateUrl: './entity-view.component.html',
   styleUrl: './entity-view.component.scss'
})
export class EntityViewComponent implements OnChanges {
   @Input() public entity?: any;
   @Input() public fields!: FieldSchema[];
   public groupedFields: { name: string; fields: FieldSchema[] }[] = [];

   constructor(private translator: TranslateService) {}

   ngOnChanges(changes: SimpleChanges): void {
      if (changes['fields']) {
         const groups = uniq(this.visibleFields.map(({ group }) => group || ''));
         this.groupedFields = groups.map((group) => ({
            name: group,
            fields: this.visibleFields.filter((field) => (field.group || '') === (group || ''))
         }));
      }
   }

   get visibleFields() {
      return this.fields.filter((field) => field.viewState !== 'hidden');
   }

   getFieldDescription(field: FieldSchema) {
      if (!field.description) return '';

      const md = markdownit();
      return md.render(field.description);
   }

   getFieldTitle(field: FieldSchema) {
      return getFieldTitle(field, this.translator);
   }
}
