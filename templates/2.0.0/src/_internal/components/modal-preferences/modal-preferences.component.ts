import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import orderBy from 'lodash.orderby';
import { FieldSchema } from '../../types';
import { readLocalStorage, writeLocalStorage } from '../../utils';

@Component({
   selector: 'app-modal-preferences',
   standalone: false,
   templateUrl: './modal-preferences.component.html',
   styleUrl: './modal-preferences.component.scss'
})
export class ModalPreferencesComponent implements OnChanges {
   @Input() isOpen = false;
   @Output() close = new EventEmitter<void>();
   @Input() key!: string;
   @Input() listFields!: FieldSchema[];

   hiddens: string[] = [];
   orderedFields: FieldSchema[] = [];

   ngOnChanges(changes: SimpleChanges): void {
      if (changes['listFields']) {
         this.hiddens = readLocalStorage<string[]>(`${this.key}-fields-hiddens`, []);
         this.orderedFields = orderBy(this.listFields || [], 'order');
      }
   }

   handleClick(ev: MouseEvent) {
      ev.stopPropagation();
      ev.preventDefault();
   }

   toggleField(selected: boolean, field: string) {
      if (selected) {
         this.hiddens = this.hiddens.filter((h) => h !== field);
      } else {
         this.hiddens.push(field);
      }
   }

   drop(event: any) {
      const { previousIndex, currentIndex } = event as CdkDragDrop<string[]>;
      const field = this.orderedFields.splice(previousIndex, 1)[0];
      this.orderedFields.splice(currentIndex, 0, field);
   }

   handleConfirm() {
      this.close.emit();
      writeLocalStorage(`${this.key}-fields-hiddens`, this.hiddens);
   }
}
