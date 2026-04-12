import { Component, EventEmitter, Injector, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import orderBy from 'lodash.orderby';
import { EntityService } from '../../services';
import type { Entity, EntityId, FieldSchema, FormAction, SortOrder } from '../../types';
import { getFieldSingleRawValue, getFieldTitle, readLocalStorage, toggleValue } from '../../utils';

@Component({
   selector: 'app-data-table',
   standalone: false,
   templateUrl: './data-table.component.html',
   styleUrl: './data-table.component.scss'
})
export class DataTableComponent {
   @Input() fields!: FieldSchema[];
   @Input() items?: Entity[];
   @Input() canSelect: boolean = false;
   @Input() selectedItem?: Entity;
   @Input() hiddenFieldsStorageKey?: string;
   @Input() itemActions: FormAction[] = [];
   @Input() service!: EntityService;
   @Output() public onSelectItem = new EventEmitter<any>();
   @Output() public onItemAction = new EventEmitter<{ item: Entity; action: FormAction }>();
   @Output() public onSort = new EventEmitter<{
      field: string;
      order: SortOrder;
   }>();
   @Output() multiSelectionChange = new EventEmitter<EntityId[]>();

   constructor(
      private translator: TranslateService,
      public injector: Injector
   ) {}

   // multi select mode
   multiSelections: EntityId[] = [];

   toggleAllSelection() {
      if (this.multiSelections.length) {
         this.multiSelections = [];
      } else {
         this.multiSelections = this.items!.map((item) => item.id!);
      }
      this.multiSelectionChange.emit(this.multiSelections);
   }

   handleRowFocus(item: Entity) {
      if (!this.multiSelections.length) {
         this.onSelectItem.emit(item);
      }
   }

   toggleMultiSelection(item: Entity, ev?: MouseEvent) {
      ev?.preventDefault(); // to prevent single select
      this.onSelectItem.emit(null);
      toggleValue(this.multiSelections, item.id);
      this.multiSelectionChange.emit(this.multiSelections);
   }

   get orderedFields() {
      const _orderedFields = orderBy(this.fields, 'order');
      const hiddenFields = this.hiddenFieldsStorageKey
         ? readLocalStorage<string[]>(this.hiddenFieldsStorageKey, [])
         : [];
      return _orderedFields.filter((f) => !hiddenFields.includes(f.name!));
   }

   sortOrder: SortOrder = 'asc';
   sortField = '';

   handleClickHeader(field: FieldSchema) {
      if (field.sortable) {
         if (this.sortField === field.sortParamName) {
            this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
         } else {
            this.sortField = field.sortParamName!;
            this.sortOrder = 'asc';
         }
         this.onSort.emit({ field: this.sortField, order: this.sortOrder });
      }
   }

   getFieldTitle(field: FieldSchema) {
      return getFieldTitle(field, this.translator);
   }

   getFieldSingleRawValue(entity: Entity, field: FieldSchema) {
      return getFieldSingleRawValue(entity, field);
   }
}
