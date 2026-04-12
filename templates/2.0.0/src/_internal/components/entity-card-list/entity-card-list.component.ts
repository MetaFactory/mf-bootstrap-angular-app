import {
   AfterViewInit,
   Component,
   ElementRef,
   EventEmitter,
   Input,
   Output,
   ViewChild
} from '@angular/core';
import { Entity, EntityId, FieldSchema, FormAction } from '../../types';
import { getFieldSingleRawValue } from '../../utils';

@Component({
   selector: 'app-entity-card-list',
   standalone: false,
   templateUrl: './entity-card-list.component.html',
   styleUrl: './entity-card-list.component.scss'
})
export class EntityCardListComponent implements AfterViewInit {
   @Input() fields!: FieldSchema[];
   @Input() items?: any[];
   @Input() selectedItem: any = null;
   @Input() canSelect: boolean = false;
   @Output() public onSelectItem = new EventEmitter<any>();
   @Output() public selectionChange = new EventEmitter<EntityId[]>();
   @Input() itemActions: FormAction[] = [];
   @Output() public onItemAction = new EventEmitter<{ item: Entity; action: FormAction }>();
   @ViewChild('list', { static: false }) list!: ElementRef<HTMLUListElement>;

   getFieldSingleRawValue(item: Entity, field: FieldSchema) {
      return getFieldSingleRawValue(item, field);
   }

   ngAfterViewInit(): void {
      setTimeout(() => {
         this.scrollToSelectedItem();
      }, 500);
   }

   scrollToSelectedItem(): void {
      const selectedLi = this.list.nativeElement.querySelector('.list-item.selected');
      if (selectedLi) {
         selectedLi.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
   }
}
