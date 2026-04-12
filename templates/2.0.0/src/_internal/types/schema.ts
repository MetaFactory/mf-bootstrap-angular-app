import { Injector, Type } from '@angular/core';
import type {
   ApiCallParams,
   DataTableSorting,
   Entity,
   EntityFilters,
   EntityId,
   EntityListDto,
   EntityListItemDto,
   SelectOption
} from './entity';

export type FieldType =
   | 'TEXT'
   | 'NUMBER'
   | 'DATE'
   | 'DATE_TIME'
   | 'TIME'
   | 'SELECT'
   | 'SELECT-WEEK'
   | 'BOOLEAN'
   | 'IMAGE'
   | 'FILE'
   | 'JSON'
   | 'PASSWORD'
   | 'PHONE' // Deprecated: Use "tel:{{phone}}" in the URL field instead.
   | 'EMAIL'; // Deprecated: Use "mailto:{{email}}" in the URL field instead.

export type FieldSchema = Partial<{
   name: string;

   /**
    * The title of the field.
    *
    * @default "name" - If not specified, the field's title defaults to its `name` property.
    */
   title: string;

   /**
    * Specifies the key for the multi-language title.
    *
    * If the `translationBase` property is provided, it will be used for translations.
    * Otherwise, the `title` property will be used as the fallback.
    */
   translationBase: string;

   /**
    * Defines the field type. Supported types include:
    *
    * - `'TEXT'`: A simple text input.
    * - `'EMAIL'`: email input.
    * - `'PHONE'`: phone number input.
    * - `'NUMBER'`: Numeric input.
    * - `'DATE'`: Date picker.
    * - `'DATE_TIME'`: Date and time picker.
    * - `'TIME'`: Time picker.
    * - `'SELECT'`: Dropdown select.
    * - `'SELECT-WEEK'`: Week selection.
    * - `'BOOLEAN'`: Boolean input, often represented as a checkbox or toggle.
    * - `'IMAGE'`: Image upload or display.
    * - `'FILE'`: File upload.
    * - `'JSON'`: JSON input or display.
    * - `'PASSWORD'`: Password input.
    */
   type: FieldType;

   /**
    * Specifies the URL associated with the field.
    *
    * - For image fields: Represents the file URL.
    * - For text-based fields: Converts the field into a hyperlink.
    *   Example: `'/tasks/{{task.id}}'`
    */
   url: string;

   /**
    * Executes a custom hook when a link is clicked, overriding the default click behavior.
    *
    * @param cn - Context only has record and injector properties
    * @returns A `Promise<void>` that resolves when the custom logic is complete.
    */
   onUrlClick: (cn: FormActionContext) => Promise<void>;

   /**
    * Defines the autocomplete behavior for the field.
    *
    * - `url`: (Optional) Specifies the API endpoint for fetching autocomplete suggestions.
    * - `paramName`: The query parameter name used when `url` is provided.
    *   If `url` is not specified, this follows the HTML standard autocomplete values
    *   (e.g., `new-password`, `current-password`).
    */
   autocomplete: {
      url?: string;

      /**
       * The query parameter name passed when `url` is specified, or an HTML standard
       * autocomplete value when `url` is not provided.
       */
      paramName: string;
   };

   /**
    * Indicates whether the field uses an enumeration of values.
    *
    * This property is applicable only when the `type` is `'SELECT'`.
    */
   isEnum: boolean;

   /**
    * Default options for type: BOOLEAN
    *
    * ```typescript
    * [
    *   {
    *     id: true,
    *     displayValue: 'YES',
    *     icon: 'check_box'
    *   },
    *   {
    *     id: false,
    *     displayValue: 'NO',
    *     icon: 'check_box_outline_blank'
    *   }
    * ]
    * ```
    */
   options: SelectOption[];

   /**
    * Specifies whether multiple selections are allowed.
    *
    * This property is applicable only when the `type` is `'SELECT'`.
    */
   multi: boolean;

   /**
    * Specifies whether the field is required in Edit mode.
    *
    * @default false - The field is not required by default.
    */
   required: boolean;

   /**
    * The default value for the field.
    *
    * - For fields of type `'SELECT'`, this must be a `TaskOption` object.
    * - For other types, the value can vary based on the field type.
    */
   defaultValue: unknown;

   /**
    * Provides additional information or context for the field.
    */
   description: string;

   /**
    * Determines whether the column in the data table is sortable.
    *
    * @default true - When set to false, the column cannot be sorted.
    */
   sortable: boolean;

   /**
    * (Optional) Specifies the parameter name to be used when sorting by this column.
    * By default, "name" will be passed as the sorting parameter.
    * If the backend expects a different parameter name, you can override it by setting `sortParamName`.
    */
   sortParamName: string;

   /**
    * Specifies the conditions under which the field is visible.
    *
    * The `FieldsQuery` object defines the visibility logic with the following structure:
    *
    * Example:
    * ```typescript
    * {
    *   field: 'name',      // The name of the field to evaluate
    *   value: 'Jack',      // The value to compare
    *   operator: 'eq'      // The comparison operator (e.g., 'eq', 'neq', 'gt', 'lt')
    * }
    * ```
    */
   visibleOn: FieldsQuery;

   /**
    * Specifies the group to which the field belongs.
    *
    * This is used in the entity view or edit interface to organize fields into logical groups.
    */
   group: string;

   /**
    * Indicates whether the value of the text field is in Markdown format.
    *
    * If true, the value must be converted to HTML to display the formatting correctly.
    * This property is applicable only to multiline `TEXT` fields.
    */
   isMarkdown: boolean;

   /**
    * Specifies whether the `TEXT` field supports multiline input.
    *
    * This property is applicable only to `TEXT` fields.
    */
   multiline: boolean;

   /**
    * Specifies a regular expression pattern used for validating the field's value.
    *
    * This property is applicable only to `TEXT` fields.
    */
   pattern: string;

   /**
    * Specifies the format to be applied to the field's value.
    *
    * - **Number Formatting**: Use numeral.js formats for numbers.
    *   See: [Numeral.js Documentation](http://numeraljs.com/)
    *   Examples:
    *   - `format: "0,0"` → Outputs: `1,000`
    *   - `format: "0.00"` → Outputs: `100000.12`
    *
    * - **Date Formatting**: Use date-fns formats for dates.
    *   See: [date-fns Documentation](https://date-fns.org/v2.24.0/docs/format)
    *   Examples:
    *   - `format: "yyyy-MM-dd HH:mm"` → Outputs: `2024-12-02 14:30`
    */
   format: string;

   /**
    * Specifies the field's state in View mode.
    *
    * @default 'visible' - The field is visible by default.
    */
   viewState: 'visible' | 'hidden';

   /**
    * Specifies the field's state in Edit mode.
    *
    * @default 'visible' - The field is visible by default.
    *
    * Possible values:
    * - `'visible'`: The field is editable.
    * - `'hidden'`: The field is not displayed.
    * - `'readonly'`: The field is displayed but not editable.
    */
   editState: 'visible' | 'hidden' | 'readonly';

   /**
    * Specifies the field's state in Insert mode.
    *
    * @default The value of `editState`.
    *
    * Possible values:
    * - `'visible'`: The field is editable.
    * - `'hidden'`: The field is not displayed.
    * - `'readonly'`: The field is displayed but not editable.
    */
   insertState: 'visible' | 'hidden' | 'readonly';
}>;

export type FieldsQuery = {
   field: string;
   value?: unknown;

   /*
    eg - equal to.
    nn - not null
    nl - null
    neq - Not equal to.
    gt - Greater than.
    gte - Greater than or equal to.
    lt - Less than.
    lte - Less than or equal to.
    in - Included in an array of specified values.
    nin - Not included in an array of specified values.
    like - Matching a pattern (similar to SQL LIKE).
    nlike - Not matching a pattern.
    between - Between two values (often inclusive).
    nbetween - Not between two values.
    */
   operator:
      | 'eq'
      | 'nn'
      | 'nl'
      | 'neq'
      | 'gt'
      | 'gte'
      | 'lt'
      | 'lte'
      | 'in'
      | 'nin'
      | 'like'
      | 'nlike'
      | 'between'
      | 'nbetween';
};

export type SelectFieldOptionsSearch = {
   field: FieldSchema;
   search: string;
};

export type ViewTemplate = 'multi-column' | 'multi-tab' | 'grouped';

export type FormSchema = Partial<{
   /**
    * Used as the title of form header
    */
   title: string;

   /**
    * (Markdown) Used as the head description of the form
    */
   description: string;

   /**
    * for styling purpose
    */
   name?: string;

   /**
    * frontend url path, by default serviceName for data table and serviceName + '/:id' for entity view
    */
   path: string;
   actions: FormAction[];
   type: 'data-table' | 'entity-panel' | 'free-form-modal';
   width: 'auto' | 'full' | 'sm' | 'md' | 'lg' | 'xl';

   /**
    * Seconds
    */
   autoRefresh: number;

   /**
    * Redux service name
    */
   serviceName: string;

   /**
    * OnInit event hook (e.g. story-bulk-edit.action.ts).
    * within Modal Forms: Set the cn.state to bind the desired data to the modal form!
    */
   onInit: (cn: FormActionContext) => Promise<void>;

   /**
    * Hook used to dynamically override or adjust the default schema logic.
    * This is useful when the static schema needs to be altered based on API responses
    * or other runtime decisions (e.g., company / contacts / edit a contact ).
    * e.g. #1
    * schema.fields = await cn.service!.fetchFieldOptions(
    *   fields,
    * `employee/category/create/new?tradeshowId=${id}`
    * );
    * e.g. #2
    * const options = await callGetOptionsApi()
    * const field = schema.fields.find(field => field.name === "fieldName")
    * field.options = [{...}]
    */
   onSchemaUpdate?: (cn: FormActionContext, schema: FormSchema) => Promise<void>;

   fields: FieldSchema[];
}>;

export type ActionCommand =
   | 'view-item'
   | 'new-item'
   | 'edit-item'
   | 'duplicate-item'
   | 'delete-item'
   | 'export-excel'
   | 'list-preferences';

export type FormAction = {
   /**
    * Empty means custom action
    */
   command?: ActionCommand;

   /**
    * #1: If 'handler' hook is set it will be called
    */
   handler?(cn: FormActionContext): Promise<void>;

   /**
    * #2: A modal form with the 'schema' will be shown
    */
   schema?: FormSchema;

   /**
    * #3: A modal with the given Angular component
    */
   component?: Type<any>;

   standalone?: boolean;
   title?: string;
   icon?: string;
   visibility?: FormActionVisibility;

   /**
    * css will be applied on target action button as the css class(es)
    */
   css?: string;
};

export type FormActionVisibility =
   | 'more' // Default, show in more menu
   | 'always' // always show the action button on top right
   | 'multi-select' // if the host is a 'DataTable' with enabled 'multiSelect' flag, it will be appeared after selecting the first row
   | 'row'; // action icon will be appeared at the end of row while hovering the row

export type FormActionContext = {
   schema?: FormSchema;

   /**
    * @see [Entity Service Implementation](https://github.com/MetaFactory/metafactory-frontend-common/blob/main/src/services/entity/entity.service.ts)
    */
   service?: IEntityService;
   serviceName?: string;
   injector: Injector;

   /**
    * Holds the data view entity
    */
   entity?: Entity | null;

   /**
    * Holds the data table selected record
    */
   record?: Entity | null;

   parentEntity?: Entity | null;

   /**
    * Holds the data table selected entity Ids
    */
   selections?: EntityId[];

   /**
    * Holds the data table items
    */
   items?: Entity[];

   /**
    * Holds the current data table filter value
    */
   filter?: Record<string, unknown>;

   /**
    * Holds the current data table sorting value
    */
   sorting?: DataTableSorting | null;

   /**
    * Used to keep data in the context life cycle (e.g. in Modal editable forms you have to set the state on OnInit, then it will be used as the
    * form data binding source)
    */
   state?: Record<string, unknown>;

   /**
    * Indicates if the current action is happening in the details section
    */
   isInDetailsArea?: boolean;

   /**
    * In case the action is originated from a multi-tab or multi-column view
    */
   section?: FormSchemaSection;

   /**
    * Reloads the content of this section
    */
   reloadSection?: () => Promise<void>;
};

export type FormSchemaDataTable = Partial<
   FormSchema & {
      filterFields: FieldSchema[];

      /**
       * For the backward compatibility, e.g. Hours admin reports
       */
      avoidCallingFilterEndpoint: boolean;
      multiSelect: boolean;
      canInsert: boolean;

      /*
       *  onSelect event hook will be called when a row is selected
       */
      onSelect: FormAction;

      /*
       * onDataLoaded hook will be called when EntityService.getEntityList is called (before normalizing)
       * for processing the received data in custom scenarios (e.g. hour.schema.ts)
       */
      onDataLoaded?(params: { data: unknown }): Promise<EntityListDto>;

      /**
       * Passes pageSize to the GET list api. Default is 20
       */
      pageSize?: number;
   }
>;

export type FormSchemaEntityPanel = FormSchema & {
   viewTemplate: ViewTemplate;
   sections: FormSchemaSection[];

   /**
    * Shows Duplicate button, Default: false
    */
   canDuplicate: boolean;

   /**
    * Shows Edit button, Default: false
    */
   canEdit: boolean;

   /**
    * Shows Delete button, Default: false
    */
   canDelete: boolean;

   /**
    * onEntityLoaded hook will be called when EntityService.getEntity is called for processing the received data in custom scenarios
    */
   onEntityLoaded?(params: { data: unknown; entityId: EntityId }): Promise<Entity>;

   onEntityPanelSchemaUpdate?: (
      cn: FormActionContext,
      schema: FormSchemaEntityPanel
   ) => Promise<void>;
};

export type FormSchemaSection = {
   name: string;
   schema: FormSchemaDataTable;

   lazyLoad?: {
      /**
       * url to fetch lazy loading data. Will be fetched on first tab select.
       * Place holders (e.g.  /employee/task?companyId={{companyId}} ) will be replaced by the related property value
       */
      url: string;

      /**
       * True: calls normalizeDataList to map the result data based on entity APIs data structure
       * False: returns the data without any mapping
       */
      standardEntityDataMapping: boolean;

      /**
       * A hook function to map the data (either coming from url or innerProperty) to the desired structure.
       */
      resultMapHook?: (cn: FormActionContext, res: any) => any;
   };
};

export type LoadEntityListArgs = {
   filter?: unknown;
   sorting?: DataTableSorting | null;
   page?: number;
   pageSize?: number;
   listFields: FieldSchema[];
   filterFields: FieldSchema[];
   saveHistory?: boolean;

   /**
    * if onDataLoaded hook is provided, first, the result of getList API will be passed to it, then the normalizeDataList will be called with the processed.
    * @param data: the result of getList API
    * @returns: the new processed data
    */
   onDataLoaded?: (params: { data: unknown }) => Promise<EntityListDto>;
   signal?: AbortSignal;
};

export interface GetEntityArgs {
   /**
    * if it sets to true, the result will not be normalized and will be returned as it is received from the api.
    */
   noNormalization?: boolean;

   /**
    * if it is specified, then the result data is normalized and also
    */
   fields?: FieldSchema[];

   /**
    * if is not specified, then the default url will be used
    */
   url?: string;
}

export type GetEditEntityArgs = {
   noNormalization?: boolean;
   fields?: FieldSchema[];
   url?: string;
};

export interface IEntityService {
   exportToExcel(schema: FormSchemaDataTable): Promise<unknown>;

   getEntityList<ITEM extends EntityListItemDto = EntityListItemDto>({
      filterFields,
      listFields,
      filter,
      sorting,
      page,
      pageSize,
      saveHistory,
      onDataLoaded,
      signal
   }: LoadEntityListArgs): Promise<{
      items?: ITEM[];
      totalElements?: number;
      pageNumber?: number;
      pageSize?: number;
   }>;

   removeNullOrEmptyAttributes(obj: any): void;

   getEntity<T extends Entity>(id: EntityId, params: GetEntityArgs): Promise<T>;

   /**
    * Fetches the entity to be edited by its ID.
    *
    * This method retrieves the entity data and optionally normalizes it based on the specified fields.
    *
    * @param id - The unique identifier of the entity to fetch.
    * @param params - Parameters for the fetch operation.
    *
    * @returns A `Promise` that resolves with the fetched entity.
    *
    * @see [Entity Service Implementation](https://github.com/MetaFactory/metafactory-frontend-common/blob/main/src/services/entity/entity.service.ts#L193-L205)
    */
   getEditEntity<T extends Entity>(id: EntityId, params: GetEntityArgs): Promise<T>;

   getDuplicatedEntity<T extends Entity>(id: EntityId, params: GetEntityArgs): Promise<T>;

   getNewEntity<T extends Entity = Entity>(params: GetEntityArgs): Promise<T>;

   /**
    * Fetches options for the given fields by calling the API with the specified URL.
    *
    * This method is typically used to populate field options dynamically
    * when creating or editing an entity. The API endpoint can be specified explicitly
    * or use default endpoints for new or editing entities. It also first, normalizes the fields.
    *
    * @param fields - An array of field schemas for which options need to be fetched.
    *                 Each field schema defines the metadata and configuration of a field.
    * @param url - The API endpoint to call for fetching options. If url is not provided, the standard (e.g. '/employee/company/edit/new')
    * GET new entity api is called
    *
    * Example:
    * ```
    * const fields = [
    *    { name: 'status', type: 'SELECT', options: [] },
    *    { name: 'language', type: 'SELECT', options: [] }
    * ];
    * await fetchFieldOptions(fields);
    * ```
    */
   fetchFieldOptions(fields: FieldSchema[], url?: string): Promise<FieldSchema[]>;

   /**
    * Processes field options by normalizing and populating them based on the entity data.
    * @param fields - The list of field schemas to normalize.
    * @param entity - The entity containing field options.
    * @returns A promise resolving to an array of updated field schemas.
    */
   processFieldOptions(fields: FieldSchema[], entity: Entity): Promise<FieldSchema[]>;

   getBulkEditNewEntity<T extends Entity = Entity>(params: GetEntityArgs): Promise<T>;

   bulkEdit(
      value: unknown,
      editFields: FieldSchema[],
      selections: EntityId[],
      entityName: string
   ): Promise<void>;

   upsert<T extends Entity>(value: unknown, editFields: FieldSchema[]): Promise<T>;

   upsertRaw<T = unknown>(value: T): Promise<T>;

   deleteEntity(id: EntityId): Promise<void>;

   getEntityOptions(path: string, entityName: string, value: string): void;

   prepareFiltersFieldSchemaList(initialValue?: FieldSchema[]): Promise<unknown>;

   getEntityFilters(): Promise<EntityFilters>;

   filterListOptions(url: string, filterKey: string, filter: string): Promise<SelectOption[]>;

   exportToExcel(schema: FormSchemaDataTable): Promise<unknown>;

   request<T>(path: string, args?: ApiCallParams): Promise<T>;
}
