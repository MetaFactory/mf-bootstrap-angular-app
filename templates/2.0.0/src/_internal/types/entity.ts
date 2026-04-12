export type SortOrder = 'asc' | 'desc';

export type DataTableSorting = {
   field: string;
   order: SortOrder;
};

export type SelectOption = {
   id: number | string | boolean | null;
   displayValue: string;
   icon?: string;
   groupName?: string | null;
   translateString?: string | null;
};

export type EntityListDto<T extends EntityListItemDto = EntityListItemDto> = {
   items: T[];
   totalElements: number;
   pageSize: number;
   pageNumber: number;
   pageCount: number;
};

export type EntityId = number | string;

export type EntityListItemDto = {
   createdOn: string;
   updatedOn: string;
   creator: string;
   updater: string;
   id: EntityId;
};

export type Entity = Record<string, unknown> & {
   id?: EntityId | null;
   displayValue?: string;
};

export type EntityFiltersDto = {
   filters: EntityFilters;
};

export type EntityStateEntity<ITEM extends EntityListItemDto> = {
   list: ITEM[];
   total: number;
   hasMore: boolean;
   filter: Record<string, unknown>;
   sorting: DataTableSorting | null;
};

export type EntityState<ITEM extends EntityListItemDto> = {
   entity: EntityStateEntity<ITEM>;
};

export type EntityViewMode = 'view' | 'edit' | 'create' | 'state';

export type EntityFilters = {
   [key: string]: {
      type: string;
      multi: boolean;
      options: SelectOption[];
   };
};

export type ApiCallMethodType = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type ApiCallParams = {
   method?: ApiCallMethodType;
   payload?: unknown | undefined;

   /**
    * Default: true, if false, the request will not include the Authorization header with the token.
    */
   withAuth?: boolean;
   authority?: string;
   observe?: 'body' | 'events' | 'response';
   timeout?: number;
   signal?: AbortSignal;

   /**
    * Default: 'json', the response type of the request.
    */
   responseType?: 'json' | 'blob';

   // if true, the request will be sent without /api prefix
   rootApi?: boolean;
};
