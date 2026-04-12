import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { SelectOption } from '../../types';

@Component({
   selector: 'app-paginator',
   standalone: false,
   templateUrl: './paginator.component.html',
   styleUrl: './paginator.component.scss'
})
export class PaginatorComponent implements OnChanges {
   @Input() totalElements!: number;
   @Input() showFirstLastIcon = true;
   @Input() pageNumber = 0;
   @Output() onPageChange: EventEmitter<number> = new EventEmitter();

   @Input() pageSizeOptions!: number[];
   @Input() pageSize!: number;
   @Output() onPageSizeChange: EventEmitter<number> = new EventEmitter();

   paginatorPages: number[] = [];
   rowsPerPageOptionsList: SelectOption[] = [];

   ngOnChanges(changes: SimpleChanges): void {
      this.paginatorPages = [];
      const totalPages = Math.ceil(this.totalElements / this.pageSize);
      const startPage = Math.max(0, this.pageNumber - 2);
      const endPage = Math.min(totalPages - 1, this.pageNumber + 2);
      for (let i = startPage; i <= endPage; i++) {
         this.paginatorPages.push(i);
      }

      this.rowsPerPageOptionsList = this.pageSizeOptions.map((option) => ({
         id: option,
         displayValue: option.toString()
      }));
   }

   goLast() {
      this.onPageChange.emit(Math.ceil(this.totalElements / this.pageSize));
   }

   goToPage(page: number) {
      this.onPageChange.emit(page);
   }

   changeRowsPerPage($event: unknown) {
      this.onPageSizeChange.emit(($event as SelectOption).id as number);
   }
}
