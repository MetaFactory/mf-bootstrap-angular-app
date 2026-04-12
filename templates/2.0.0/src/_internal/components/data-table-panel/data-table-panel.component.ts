import { Location } from '@angular/common';
import {
   Component,
   ContentChildren,
   EventEmitter,
   Injector,
   Input,
   OnChanges,
   OnDestroy,
   OnInit,
   Output,
   QueryList,
   SimpleChanges,
   Type
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Subscription, filter } from 'rxjs';
import { QUERY_PARAM_SELECT } from '../../constants';
import { EntityService, EntityStateEntity } from '../../services';
import { GeneralService, GeneralState } from '../../services/general';
import type {
   DataTableSorting,
   Entity,
   EntityId,
   EntityListItemDto,
   FormAction,
   FormSchemaDataTable,
   LoadEntityListArgs,
   ProgressStatus
} from '../../types';
import { cloneSchema } from '../../utils';
import { TabComponent } from '../tab-container/tab/tab.component';
import { ToastifyService } from '../toastify/toastify.service';

@Component({
   selector: 'app-data-table-panel',
   standalone: false,
   templateUrl: './data-table-panel.component.html',
   providers: [],
   styleUrl: './data-table-panel.component.scss'
})
export class DataTablePanelComponent implements OnDestroy, OnChanges, OnInit {
   @Input() formSchema!: FormSchemaDataTable;
   @Input() service!: EntityService;
   @ContentChildren(TabComponent) tabs!: QueryList<TabComponent>;
   @Output() onSelectItem = new EventEmitter<unknown>();

   state$!: BehaviorSubject<EntityStateEntity<EntityListItemDto>>;
   page = 0;
   selectedEntity?: Entity;
   authority? = '';
   selectedTab: TabComponent | null = null;
   showMoreMenu = false;
   preferencesVisible = false;
   resizeObserver?: ResizeObserver;
   customModalComponent?: Type<any>;
   loadingStatus: ProgressStatus = 'idle';
   emptyDataMessage: string = ''; // When there is no data or filtering required
   autoRefreshInterval?: any;
   selections: EntityId[] = [];
   itemActions: FormAction[] = [];
   refreshMainPanelSubscription?: Subscription;
   itemIdInPath?: EntityId;
   currentPath?: string;
   schema!: FormSchemaDataTable;
   private abortController: AbortController | null = null;

   // From Redux
   general$!: BehaviorSubject<GeneralState>;

   constructor(
      private titleService: Title,
      private generalService: GeneralService,
      private router: Router,
      private location: Location,
      private injector: Injector,
      private toastifyService: ToastifyService
   ) {
      this.general$ = this.generalService.select<GeneralState>((state) => state);
      this.currentPath = this.router.url;

      const currentUrlTree = this.router.parseUrl(this.location.path());
      const query = { ...currentUrlTree.queryParams };
      const rawId = query[QUERY_PARAM_SELECT];
      if (rawId != null) {
         const num = Number(rawId);
         this.itemIdInPath = Number.isFinite(num) ? num : rawId;
      }
   }

   ngOnInit(): void {
      this.refreshMainPanelSubscription = this.generalService.refreshMainPanel$.subscribe(() => {
         this.loadList({});
      });

      this.router.events
         .pipe(filter((event) => event instanceof NavigationEnd))
         .subscribe((event) => {
            if (event instanceof NavigationEnd) {
               this.currentPath = event.url;
            }
         });
   }

   async ngOnChanges(changes: SimpleChanges) {
      if (changes['formSchema']) {
         this.schema = this.formSchema;

         if (this.schema.onSchemaUpdate) {
            this.schema = cloneSchema(this.schema);
            await this.schema.onSchemaUpdate!({ injector: this.injector }, this.schema);
         }

         if (!this.schema.avoidCallingFilterEndpoint) {
            await this.service.prepareFiltersFieldSchemaList(this.schema.filterFields);
         }

         this.titleService.setTitle(this.schema.title!);

         if (this.schema.filterFields) {
            // Then "this.loadList" will be called immediately with default filter
         } else {
            await this.loadList({});
         }

         if (this.schema.autoRefresh && !this.autoRefreshInterval) {
            this.autoRefreshInterval = setInterval(
               () => this.loadList({}),
               this.schema.autoRefresh * 1000 // to ms
            );
         }

         this.itemActions =
            this.schema.actions?.filter((action) => action.visibility === 'row') ?? [];
      }

      if (changes['service']) {
         this.state$ = this.service.select((state) => state.entity);
      }
   }

   ngOnDestroy() {
      clearInterval(this.autoRefreshInterval);

      if (this.state$) {
         this.state$.complete();
      }

      if (this.resizeObserver) {
         this.resizeObserver.disconnect(); // Clean up to avoid memory leaks
      }

      if (this.refreshMainPanelSubscription) {
         this.refreshMainPanelSubscription.unsubscribe();
      }
   }

   async filter(filter: Record<string, unknown>) {
      this.page = 0;
      await this.loadList({ filter });
   }

   async sort(sorting: DataTableSorting) {
      this.page = 0;
      await this.loadList({ sorting });
   }

   async showMore() {
      this.page++;
      await this.loadList({ page: this.page });
   }

   async loadList(params: Partial<LoadEntityListArgs>) {
      try {
         if (this.loadingStatus === 'in-progress') {
            this.abortController?.abort();
         }
         this.abortController = new AbortController();
         const { signal } = this.abortController;

         this.loadingStatus = 'in-progress';
         this.selectEntity();

         if (!this.schema.fields) throw "Configuration Error: 'fields' is expected.";

         const { items, validationError } = await this.service.getEntityList({
            ...params,
            filterFields: this.schema.filterFields ?? [],
            listFields: this.schema.fields,
            onDataLoaded: this.schema.onDataLoaded,
            pageSize: this.schema.pageSize,
            signal
         });

         this.loadingStatus = 'idle';
         this.abortController = null;

         if (validationError) {
            this.emptyDataMessage = validationError;
            return;
         } else {
            this.emptyDataMessage = '';
         }

         if (this.itemIdInPath) {
            const entity = items!.find((item) => item.id === this.itemIdInPath);
            this.itemIdInPath = undefined; // We only need to do it once
            if (entity) {
               this.selectEntity(entity);
            }
         }
      } catch (ex: any) {
         console.error(ex);
         if (ex.name === 'EmptyError') {
         } else {
            this.loadingStatus = 'failed';
         }
      }
   }

   async selectEntity(item?: Entity) {
      this.selectedEntity = item;
      if (item && this.schema.onSelect) {
         await this.processAction(this.schema.onSelect);
      }
      this.setSelectQueryParam(item?.id);
   }

   setSelectQueryParam(itemId?: EntityId | null) {
      const currentUrlTree = this.router.parseUrl(this.location.path(true));
      const query = { ...currentUrlTree.queryParams };

      if (itemId) {
         query[QUERY_PARAM_SELECT] = itemId;
      } else {
         delete query[QUERY_PARAM_SELECT];
      }

      const updatedUrl = this.router.createUrlTree([], {
         queryParams: query,
         queryParamsHandling: 'merge' // preserve other params
      });

      this.location.go(updatedUrl.toString());
   }

   async processAction(action: FormAction) {
      if (action.command === 'list-preferences') {
         this.showPreferences(true);
      } else {
         if (!this.state$) {
            console.warn('processAction in data-table-panel: state is not ready!');
            return;
         }
         await this.generalService.processAction(action, {
            service: this.service,
            filter: this.state$.value.filter,
            sorting: this.state$.value.sorting,
            record: this.selectedEntity,
            selections: this.selections,
            items: this.state$.value.list,
            schema: this.schema,
            isInDetailsArea: false
         });
      }
   }

   async closeEntityPanel(reload: boolean) {
      this.selectedEntity = undefined;

      if (reload) {
         await this.loadList({});
      }
   }

   openMoreMenu(show: boolean) {
      this.showMoreMenu = show;
   }

   showPreferences(show: boolean) {
      this.preferencesVisible = show;
   }

   get visibleActions() {
      return this.schema.actions?.filter(
         (action) => action.visibility === 'always' || action.visibility === 'multi-select'
      );
   }

   isActionDisabled(action: FormAction) {
      if (action.visibility !== 'multi-select') {
         return false;
      } else {
         return this.selections.length == 0;
      }
   }

   get moreActions() {
      return this.schema.actions?.filter(
         (action) => !action.visibility || action.visibility === 'more'
      );
   }

   async handleItemAction(ev: { item: Entity; action: FormAction }) {
      try {
         await this.generalService.processAction(ev.action, {
            filter: this.state$.value.filter,
            sorting: this.state$.value.sorting,
            record: ev.item,
            selections: this.selections,
            items: this.state$.value.list,
            service: this.service,
            schema: this.schema
         });
      } catch (error) {
         this.toastifyService.show(`Failed to run "${ev.action.title}".`, {
            class: 'failure',
            autoClose: 5000
         });
      }
   }
}
