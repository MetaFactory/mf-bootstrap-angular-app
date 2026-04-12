import {
   AfterViewInit,
   Component,
   ElementRef,
   EventEmitter,
   Input,
   Output,
   ViewChild
} from '@angular/core';
import { EntityService } from '../../services';
import { Entity, EntityId, FieldSchema, FormAction, SortOrder } from '../../types';

@Component({
   selector: 'app-responsive-data-table',
   standalone: false,
   templateUrl: './responsive-data-table.component.html',
   styleUrl: './responsive-data-table.component.scss'
})
export class ResponsiveDataTableComponent implements AfterViewInit {
   @Input() fields!: FieldSchema[];
   @Input() items?: Entity[];
   @Input() hasMore: boolean = false;
   @Input() canSelect: boolean = false;
   @Input() hiddenFieldsStorageKey?: string;
   @Input() selectedItem?: Entity;
   @Input() width: string | undefined = 'auto';
   @Output() onSelectItem = new EventEmitter<Entity>();
   @Output() onShowMore = new EventEmitter<any>();
   @Output() selectionChange = new EventEmitter<EntityId[]>();
   @Output() multiSelectionChange = new EventEmitter<EntityId[]>();
   @Output() onSort = new EventEmitter<{
      field: string;
      order: SortOrder;
   }>();
   @Input() itemActions: FormAction[] = [];
   @Input() service!: EntityService;
   @Output() public onItemAction = new EventEmitter<{ item: Entity; action: FormAction }>();
   @ViewChild('showMore', { static: false }) showMoreButton!: ElementRef<HTMLDivElement>;

   selectItem(item: Entity) {
      this.selectedItem = item;
      this.onSelectItem.emit(item);
   }

   ngAfterViewInit(): void {
      if (this.hasMore) {
         // Set up IntersectionObserver to monitor visibility
         const observer = new IntersectionObserver(
            ([entry]) => {
               if (entry.isIntersecting) {
                  this.onShowMore.emit();
               }
            },
            {
               root: document.querySelector('.list-panel'),
               threshold: 0
            }
         );

         if (this.showMoreButton) {
            observer.observe(this.showMoreButton.nativeElement);
         }
      }
   }
}
