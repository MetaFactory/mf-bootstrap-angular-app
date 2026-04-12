import {
   Component,
   EventEmitter,
   Injector,
   Input,
   OnChanges,
   Output,
   SimpleChanges
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService, EntityService } from '../../services';
import { GeneralService, GeneralState } from '../../services/general';
import {
   Entity,
   EntityId,
   EntityViewMode,
   FormAction,
   FormActionContext,
   FormActionState,
   FormSchemaEntityPanel,
   FormSchemaSection,
   ProgressStatus
} from '../../types';
import {
   addQueryParamToPath,
   cloneSchema,
   normalizeDataList,
   normalizeEntity,
   normalizeEntityPanelSchema,
   processTemplate
} from '../../utils';
import { ToastifyService } from '../toastify/toastify.service';

@Component({
   selector: 'app-entity-panel',
   standalone: false,
   templateUrl: './entity-panel.component.html',
   styleUrl: './entity-panel.component.scss'
})
export class EntityPanelComponent implements OnChanges {
   @Input() service!: EntityService;
   @Input() formSchema!: FormSchemaEntityPanel;
   @Input() path?: string;
   @Input() standalone = true;
   @Output() onClose = new EventEmitter();
   viewMode: EntityViewMode = 'view';
   loadingStatus: ProgressStatus = 'idle';
   selectedTab: string = '';
   entity: Entity | null = null;
   entityId: EntityId | null = null;
   editEntity: Entity | null = null;
   isConfirmDeleteOpen = false;
   autoRefreshInterval?: any;
   formActionState: FormActionState = 'Idle';
   sectionHasError: Record<string, boolean> = {};
   sectionErrorText: Record<string, string> = {};

   // From Redux
   general$!: BehaviorSubject<GeneralState>;
   schema!: FormSchemaEntityPanel;

   constructor(
      private toastifyService: ToastifyService,
      private generalService: GeneralService,
      private apiService: ApiService,
      private injector: Injector,
      private translator: TranslateService
   ) {
      this.general$ = this.generalService.select<GeneralState>((state) => state);
   }

   private isPathReady = false;
   private isFormSchemaReady = false;

   async ngOnChanges(changes: SimpleChanges) {
      if (changes['path'] && this.path) {
         this.selectedTab = '';
         this.isPathReady = true;
         this.isFormSchemaReady = !!this.schema;
      }

      if (changes['formSchema']) {
         // Override schema if onEntityPanelSchemaUpdate available
         if (this.formSchema.onEntityPanelSchemaUpdate) {
            const cn = {
               entity: this.entity,
               service: this.service,
               serviceName: this.formSchema.serviceName,
               injector: this.injector,
               isInDetailsArea: true
            } satisfies FormActionContext;

            const schema = cloneSchema<FormSchemaEntityPanel>(this.formSchema);
            await this.formSchema.onEntityPanelSchemaUpdate!(cn, schema);
            this.schema = normalizeEntityPanelSchema(schema);
         } else {
            this.schema = this.formSchema;
         }
         this.isFormSchemaReady = true;
         this.isPathReady = !!this.path;

         // Initialize section error states
         this.schema.sections?.forEach((section) => {
            this.sectionHasError[section.name] = false;
            this.sectionErrorText[section.name] = '';
         });
      }

      // Ensure logic runs only when both `path` and `formSchema` are ready
      if (this.isPathReady && this.isFormSchemaReady) {
         const parts = this.path!.split('/').filter(Boolean) || [];
         if (parts.length < 2)
            throw 'id expected in EntityPanelTypicalPageComponent path: ' + this.path;

         const isCreateMode = parts[parts.length - 1] === 'new';
         const rawId = parts[parts.length - 1];
         const num = Number(rawId);
         this.entityId = isCreateMode ? null : (Number.isFinite(num) ? num : rawId);
         await this.switchMode(isCreateMode ? 'create' : 'view');

         if (this.schema.autoRefresh && !this.autoRefreshInterval) {
            this.autoRefreshInterval = setInterval(
               () => this.viewMode == 'view' && this.switchMode('view'), // auto refresh just on view mode
               this.schema.autoRefresh * 1000
            );
         }

         this.isPathReady = false; // Reset after execution
         this.isFormSchemaReady = false;
      }
   }

   getSectionListValue(section: FormSchemaSection): Entity[] {
      return this.entity![section.name!] as Entity[];
   }

   getItemActions(section: FormSchemaSection): FormAction[] {
      return section.schema.actions?.filter((action) => action.visibility === 'row') ?? [];
   }

   getSectionVisibleActions(section: FormSchemaSection): FormAction[] {
      return (
         section.schema.actions?.filter(
            (action) => !action.visibility || action.visibility == 'always'
         ) ?? []
      );
   }

   hasSectionVisibleActions(section: FormSchemaSection) {
      return section.schema.actions?.some(
         (action) => !action.visibility || action.visibility == 'always'
      );
   }

   async selectEntity(section: FormSchemaSection, item: Entity) {
      const instance = this;
      await this.generalService.processAction(section.schema.onSelect!, {
         record: item,
         service: this.service,
         schema: section.schema,
         isInDetailsArea: true,
         section,
         async reloadSection() {
            await instance.reloadSection(section);
         }
      });
   }

   async processAction(action: FormAction, section?: FormSchemaSection) {
      switch (action.command) {
         case 'delete-item':
            this.isConfirmDeleteOpen = true;
            break;

         case 'edit-item':
            this.switchMode('edit');
            break;

         case 'duplicate-item':
            this.duplicate();
            break;

         default:
            const instance = this;
            const cn = {
               service: this.service,
               serviceName: this.schema.serviceName,
               entity: this.entity,
               schema: action.schema,
               section,
               async reloadSection() {
                  instance.reloadSection(section);
               }
            } satisfies Partial<FormActionContext>;
            await this.generalService.processAction(action, cn);
      }
   }

   async reloadSection(contextSection?: FormSchemaSection) {
      // On multi-tab always reload the current tab(section)
      const section =
         this.schema.viewTemplate === 'multi-tab'
            ? this.schema.sections.find((section) => section.name === this.selectedTab)
            : contextSection;

      await this.loadSectionLazyLoadData(section);
   }

   async switchMode(mode: EntityViewMode) {
      this.viewMode = mode;
      this.loadingStatus = 'in-progress';
      this.entity = null;
      this.editEntity = null;

      try {
         switch (mode) {
            case 'edit':
            case 'create':
               {
                  const entity =
                     mode === 'create'
                        ? await this.service.getNewEntity({
                             fields: this.schema.fields,
                             noNormalization: true
                          })
                        : await this.service.getEditEntity(this.entityId!, {
                             fields: this.schema.fields,
                             noNormalization: true
                          });

                  const fields = await this.service.processFieldOptions(
                     this.schema.fields!,
                     entity
                  );

                  this.schema = cloneSchema(this.schema, fields);
                  this.editEntity = normalizeEntity(
                     this.schema.fields ?? [],
                     entity,
                     this.translator
                  );
               }
               break;

            case 'view':
               {
                  let entity = await this.service.getEntity(this.entityId!, {
                     fields: this.schema.fields
                  });
                  if (this.schema.onEntityLoaded) {
                     entity = await this.schema.onEntityLoaded({
                        data: entity,
                        entityId: this.entityId!
                     });
                  }
                  this.entity = entity;
                  await this.loadMultiColumnSchemaLazyLoadData();
               }
               break;
         }
         this.loadingStatus = 'idle';
      } catch (ex) {
         console.error(ex);
         this.loadingStatus = 'failed';
      }
   }

   showMoreMenu: boolean = false;
   openMoreMenu(show: boolean) {
      this.showMoreMenu = show;
   }

   async loadSectionLazyLoadData(section?: FormSchemaSection, sort?: string) {
      try {
         if (section) {
            this.sectionHasError[section.name] = false;
            this.sectionErrorText[section.name] = '';
         }

         if (section?.lazyLoad && this.entity) {
            let url = processTemplate(section.lazyLoad.url, this.entity);

            // Sort
            if (sort) {
               url = addQueryParamToPath(url, 'sort', sort);
            }

            // Fetch data
            let data: any = await this.apiService.request(url);

            if (section.lazyLoad.standardEntityDataMapping) {
               data = normalizeDataList(data.items, section.schema.fields!, this.translator);
            } else if (section.lazyLoad.resultMapHook) {
               data = section.lazyLoad.resultMapHook({ injector: this.injector }, data);
            }

            this.entity[section.name!] = data;
         }
      } catch (ex) {
         if (section) {
            console.info(`Error loading data for section ${section?.name}`);
            this.sectionHasError[section.name] = true;
            this.sectionErrorText[section.name] = 'Error loading data ...';
         } else {
            throw ex;
         }
      }
   }

   async loadMultiColumnSchemaLazyLoadData() {
      if (this.schema.viewTemplate === 'multi-column') {
         for (const section of this.schema.sections) {
            await this.loadSectionLazyLoadData(section);
         }
      }
   }

   async selectTab(section?: FormSchemaSection) {
      this.selectedTab = section?.name || '';
      await this.loadSectionLazyLoadData(section);
   }

   get isNew() {
      return !this.entity?.id;
   }

   handleChange(value: any) {
      this.entity = value;
   }

   get title(): string {
      switch (this.viewMode) {
         case 'create':
            return 'New ' + this.schema.title;

         case 'edit':
            return this.editEntity?.displayValue || this.schema.title || '';

         default:
            return this.entity?.displayValue || this.schema.title || '';
      }
   }

   async handleUpsert(value: any) {
      try {
         this.formActionState = 'Running';
         const result = await this.service.upsert(
            {
               ...value,
               id: this.entityId // for create and duplicate must be null
            },
            this.schema.fields!
         );
         this.formActionState = 'Idle';

         if (this.viewMode === 'create') {
            this.toastifyService.success(`${this.schema.title} is created!`);
            this.onClose.emit();
         } else {
            this.toastifyService.success(`${this.schema.title} is saved!`);
            const entity = await this.service!.getEntity(result.id!, {
               fields: this.schema!.fields
            });
            this.entity = entity;
            this.viewMode = 'view';
         }
      } catch (error) {
         console.error(error);
         this.formActionState = 'Idle';
         this.toastifyService.failure(
            this.viewMode === 'create'
               ? `Creating the new ${this.schema.title} item failed!`
               : `Error saving the ${this.schema.title}!`
         );
      }
   }

   goBack() {
      if (this.general$.value.isMobile) {
         this.onClose.emit();
      } else {
         window.history.back();
      }
   }

   async duplicate() {
      this.editEntity = await this.service.getDuplicatedEntity(this.entity?.id!, {
         fields: this.schema.fields
      });

      this.entityId = null; // to prevent updating the selected entity
      this.viewMode = 'create';
   }

   async closeConfirmDelete(confirmed: boolean) {
      this.isConfirmDeleteOpen = false;
      if (!confirmed) return;

      try {
         await this.service.deleteEntity(this.entity!.id!);
         this.onClose.emit();
         this.toastifyService.success(`${this.schema.title} is deleted!`);
      } catch (error) {
         this.toastifyService.failure(`Error deleting the ${this.schema.title}!`);
      }
   }

   get moreActionsAvailable() {
      return this.schema.actions?.some(
         (action) => !action.visibility || action.visibility === 'more'
      );
   }

   handleItemAction(section: FormSchemaSection, ev: { item: Entity; action: FormAction }) {
      const instance = this;
      this.generalService.processAction(ev.action, {
         entity: ev.item,
         parentEntity: this.entity,
         schema: this.schema,
         service: this.service,
         section,
         async reloadSection() {
            await instance.reloadSection(section);
         }
      });
   }

   handleSort(params: { field: string; order: string }, section: FormSchemaSection) {
      const { field, order } = params;
      const sort = [field, order].join(',');
      this.loadSectionLazyLoadData(section, sort);
   }
}
