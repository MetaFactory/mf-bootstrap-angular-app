import { HttpClient } from '@angular/common/http';
import type { EntityFiltersDto, EntityId, EntityListDto, EntityListItemDto } from '../../types';
import { ApiService } from '../api.service';
import { ConfigService } from '../config-service';

export class EntityApi extends ApiService {
   /*
    * @param entityPath (required) the path to call, trim the slashes starting and ending, relative to the API base URL (e.g. /employee/story)
    */
   constructor(
      public entityPath: string,
      http: HttpClient,
      config: ConfigService
   ) {
      super(http, config);
   }

   getList = <ITEM extends EntityListItemDto = EntityListItemDto>(
      query: string = '',
      signal?: AbortSignal
   ) => this.request<EntityListDto<ITEM>>(this.entityPath + query, { signal });

   getEntity = <T>(id: EntityId, url?: string) => this.request<T>(url || `${this.entityPath}/` + id);

   getEdit = <T>(id: EntityId, url?: string) =>
      this.request<T>(url || `${this.entityPath}/edit/${id}`);

   getNew = <T>(url?: string) => this.request<T>(url || `${this.entityPath}/edit/new`);

   getFieldsOptions = <T>(url?: string) => this.request<T>(url || `${this.entityPath}/edit/new`);

   getBulkEditNew = <T>(url?: string) => this.request<T>(url || `${this.entityPath}/bulkedit/new`);

   getEntityFilters = () => this.request<EntityFiltersDto>(`${this.entityPath}/filters`);

   upsert = <T>(payload: unknown) =>
      this.request<T>(`${this.entityPath}/edit`, {
         payload,
         method: 'PUT'
      });

   bulkEdit = <T>(payload: unknown, query: string) =>
      this.request<T>(`${this.entityPath}/bulkedit?${query}`, {
         payload,
         method: 'PUT'
      });

   saveAndNew = <T>(payload: unknown) =>
      this.request<T>(`${this.entityPath}/saveandnew`, {
         payload,
         method: 'POST'
      });

   deleteEntity = (id: EntityId) =>
      this.request<unknown>(`${this.entityPath}/${id}`, {
         method: 'DELETE'
      });

   getEntityOptions = (path: string, entityName: string, value: string) =>
      this.request<unknown>(
         `employee/autocomplete/${path}?${entityName}TypeAheadSearchString=${value}`
      );

   exportToExcel = (query: string) =>
      this.request<unknown>(`${this.entityPath}/excel?name=export&${query}`);
}
