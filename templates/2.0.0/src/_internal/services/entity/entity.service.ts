import { Location } from '@angular/common';
import { Injector } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Slice } from '@reduxjs/toolkit';
import upperCase from 'lodash.uppercase';
import { QUERY_PARAM_FILTER } from '../../constants';
import {
   ApiCallParams,
   Entity,
   EntityId,
   EntityListDto,
   EntityListItemDto,
   FieldSchema,
   FormSchemaDataTable,
   GetEntityArgs,
   IEntityService,
   LoadEntityListArgs,
   SelectOption
} from '../../types';
import {
   capitalize,
   getFieldTitle,
   getFilterStorageKey,
   getSortingStorageKey,
   normalizeDataList,
   normalizeEntity,
   normalizeFieldsSchema,
   normalizeFiltersFields,
   normalizeSelectFieldsEntity,
   validateAndNormalizeEditDto,
   writeLocalStorage
} from '../../utils';
import { ConfigService } from '../config-service';
import { CommonState, StoreServiceBase } from '../store-service-base';
import { EntityApi } from './entity.api';
import { createListQuery } from './entity.utils';

export class EntityService<STATE extends CommonState = CommonState> implements IEntityService {
   constructor(
      protected api: EntityApi,
      private store: StoreServiceBase<STATE>,
      private slice: Slice,
      injector: Injector
   ) {
      this.translator = injector.get(TranslateService);
      this.config = injector.get(ConfigService);
      this.location = injector.get(Location);
      this.router = injector.get(Router);
      EntityService.entityServices[slice.name] = this;
   }

   private translator: TranslateService;
   private config: ConfigService;
   private location: Location;
   private router: Router;
   public static entityServices: { [serviceName: string]: EntityService } = {};

   select(selector: (state: any) => any) {
      return this.store.select((state: any) => selector(state[this.slice.name]));
   }

   validateFilters(filter: any, fields: FieldSchema[]) {
      const requiredButEmptyFilter = fields.find(
         (item) => item.required && filter[item.name!] == null
      );

      if (requiredButEmptyFilter) {
         return `Please select the "${requiredButEmptyFilter.title}"`;
      } else {
         return null;
      }
   }

   async getEntityList<ITEM extends EntityListItemDto = EntityListItemDto>({
      filterFields,
      listFields,
      filter,
      sorting,
      page = 0,
      pageSize,
      saveHistory = true,
      onDataLoaded,
      signal
   }: LoadEntityListArgs): Promise<{
      items?: ITEM[];
      totalElements?: number;
      pageNumber?: number;
      pageSize?: number;
      validationError?: string | null;
   }> {
      const {
         [this.slice.name]: { entity }
      } = this.store.getState() as any;

      // 1- Prepare the query
      const newFilter = this.removeNullOrEmptyAttributes(filter || entity.filter);
      const newSorting = sorting || entity.sorting;
      const query = createListQuery(
         filterFields,
         newFilter,
         newSorting,
         page,
         pageSize || this.config.value.listDefaultPageSize
      );

      const validationError = this.validateFilters(newFilter, filterFields ?? []);
      if (validationError) {
         return { validationError };
      }

      // 2- Get data from API
      let res = await this.api.getList(query, signal);

      // 3- Process data
      if (onDataLoaded) {
         res = (await onDataLoaded({ data: res })) as EntityListDto;
      }

      const { items, totalElements, pageNumber, pageSize: receivedSize } = res;
      const list = normalizeDataList(items, listFields!, this.translator);

      // 4- Check for options in data (with 'SearchOptions' postfix)
      filterFields
         .filter((field) => field.type === 'SELECT')
         .forEach((field) => {
            const options = (res as Record<string, unknown>)[field.name + 'SearchOptions'];
            if (options) {
               field.options = options as SelectOption[];
            }
         });

      // 5- Dispatch to State
      const hasMore = totalElements > Math.max(pageNumber + 1, 1) * receivedSize;
      this.store.dispatch(
         (this.slice.actions as any).entityListSet({
            list,
            total: totalElements,
            hasMore,
            append: page > 0
         })
      );

      // 5- Save filter and sorting history
      if (saveHistory) {
         this.store.dispatch((this.slice.actions as any).filtersSet(newFilter));
         writeLocalStorage(getFilterStorageKey(this.slice.name), newFilter);

         this.setFilterQueryParam(newFilter ? btoa(JSON.stringify(newFilter)) : '');

         this.store.dispatch((this.slice.actions as any).sortingSet(newSorting));
         writeLocalStorage(getSortingStorageKey(this.slice.name), newSorting);
      }

      return { items: items as ITEM[], totalElements, pageNumber, pageSize: receivedSize };
   }

   setFilterQueryParam(filter: string) {
      const currentUrlTree = this.router.parseUrl(this.location.path(true));
      const query = { ...currentUrlTree.queryParams };

      if (filter) {
         query[QUERY_PARAM_FILTER] = filter;
      } else {
         delete query[QUERY_PARAM_FILTER];
      }

      const updatedUrl = this.router.createUrlTree([], {
         queryParams: query,
         queryParamsHandling: 'merge' // preserve other params
      });

      this.location.go(updatedUrl.toString());
   }

   removeNullOrEmptyAttributes(obj: any) {
      const newObj = { ...obj };
      for (let key in newObj) {
         if (
            newObj[key] === null ||
            newObj[key] === '' ||
            (Array.isArray(newObj[key]) && !newObj[key].length)
         ) {
            delete newObj[key];
         }
      }
      return newObj;
   }

   async getEntity<T extends Entity>(id: EntityId, params?: GetEntityArgs): Promise<T> {
      const entity = (await this.api.getEntity(id, params?.url)) as unknown as T;

      if (params?.noNormalization) {
         return entity;
      } else {
         if (!params!.fields) {
            throw new Error(
               'The "fields" parameter is required when calling "getEntity" with normalization enabled. Please provide the necessary fields.'
            );
         }

         return normalizeSelectFieldsEntity<T>(params!.fields, entity, this.translator);
      }
   }

   async getEditEntity<T extends Entity>(id: EntityId, params?: GetEntityArgs): Promise<T> {
      const entity = (await this.api.getEdit(id, params?.url)) as unknown as T;
      if (params?.noNormalization) {
         return entity;
      } else {
         if (!params!.fields) {
            throw new Error(
               'The "fields" parameter is required when calling "getEditEntity" with normalization enabled. Please provide the necessary fields.'
            );
         }
         return normalizeEntity<T>(params!.fields, entity, this.translator);
      }
   }

   async getDuplicatedEntity<T extends Entity>(id: EntityId, params?: GetEntityArgs): Promise<T> {
      const entity = await this.api.getEdit(id, params?.url);
      const duplicatedEntity = (await this.api.saveAndNew(entity)) as unknown as T;

      if (params?.noNormalization) {
         return duplicatedEntity;
      } else {
         if (!params!.fields) {
            throw new Error(
               'The "fields" parameter is required when calling "getDuplicatedEntity" with normalization enabled. Please provide the necessary fields.'
            );
         }
         return normalizeEntity<T>(params!.fields, duplicatedEntity, this.translator);
      }
   }

   async getNewEntity<T extends Entity = Entity>(params?: GetEntityArgs): Promise<T> {
      const entity = (await this.api.getNew(params?.url)) as unknown as T;
      if (params?.noNormalization) {
         return entity;
      } else {
         if (!params!.fields) {
            throw new Error(
               'The "fields" parameter is required when calling "getNewEntity" with normalization enabled. Please provide the necessary fields.'
            );
         }
         return normalizeEntity<T>(params!.fields, entity, this.translator);
      }
   }

   async getBulkEditNewEntity<T extends Entity = Entity>(params?: GetEntityArgs): Promise<T> {
      const entity = (await this.api.getBulkEditNew(params?.url)) as unknown as T;
      if (params?.noNormalization) {
         return entity;
      } else {
         if (!params!.fields) {
            throw new Error(
               'The "fields" parameter is required when calling "getBulkEditNewEntity" with normalization enabled. Please provide the necessary fields.'
            );
         }
         return normalizeEntity<T>(params!.fields, entity, this.translator);
      }
   }

   async bulkEdit(
      value: unknown,
      editFields: FieldSchema[],
      selections: EntityId[],
      entityName: string
   ): Promise<void> {
      const valueDto = validateAndNormalizeEditDto(value, editFields);

      const queryParamName = `${entityName}Ids`;
      const query = selections.map((id) => `${queryParamName}=${id}`).join('&');
      await this.api.bulkEdit(valueDto, query);
   }

   async upsert<T extends Entity>(value: unknown, editFields: FieldSchema[]): Promise<T> {
      const valueDto = validateAndNormalizeEditDto(value, editFields);
      const entity = await this.api.upsert<T>(valueDto);

      // Update state to apply change on data table
      const result = normalizeEntity<T>(editFields, entity, this.translator);
      this.store.dispatch((this.slice.actions as any).entityUpdated(result));
      return result;
   }

   async upsertRaw<T>(value: unknown): Promise<T> {
      return await this.api.upsert<T>(value);
   }

   async deleteEntity(id: EntityId) {
      await this.api.deleteEntity(id);
      this.store.dispatch((this.slice.actions as any).entityDeleted(id)); // Not necessary, because we refresh the Main panel with GeneralService refresh subject
   }

   getEntityOptions(path: string, entityName: string, value: string) {
      return this.api.getEntityOptions(path, entityName, value);
   }

   async prepareFiltersFieldSchemaList(initialValue?: FieldSchema[]) {
      if (!initialValue) return initialValue;
      const { filters } = await this.api.getEntityFilters();
      normalizeFiltersFields(initialValue, filters, this.translator, this.config);
   }

   async getEntityFilters() {
      const { filters } = await this.api.getEntityFilters();
      return filters;
   }

   async filterListOptions(url: string, filterKey: string, filter: string) {
      if (!url)
         throw `autocomplete.url is not defined in your '.schema.ts', filterKey: '${filterKey}'`;

      return await this.api.filterListOptions(url, filterKey, filter);
   }

   async exportToExcel(schema: FormSchemaDataTable) {
      const {
         [this.slice.name]: { entity }
      } = this.store.getState() as any;

      const filterQuery = createListQuery(schema.filterFields, entity.filter, entity.sorting, 1);

      const query = (schema.fields || [])
         .map(
            (field) =>
               //! todo: it was a chain of functions on field.name
               `${schema.serviceName}SelectionList=${upperCase(schema.serviceName)}_${field.name}`
         )
         .join('&');

      return await this.api.exportToExcel(query + filterQuery);
   }

   getFieldTitle(field: FieldSchema) {
      return getFieldTitle(field, this.translator);
   }

   /**
    * Calls the API endpoint
    * @param path: the api endpoint path (skip the /api/ prefix)
    * @returns
    */
   async request<T>(path: string, params?: ApiCallParams) {
      return this.api.request(path, params) as T;
   }

   /**
    * Fetches field options from the API and processes them.
    * @param fields - The list of field schemas to process.
    * @param url - Optional API endpoint URL to fetch field options.
    * @returns A promise resolving to an array of processed field schemas.
    */
   async fetchFieldOptions(fields: FieldSchema[], url?: string): Promise<FieldSchema[]> {
      const entity = await this.api.getFieldsOptions<Entity>(url);
      return this.processFieldOptions(fields, entity);
   }

   /**
    * Processes field options by normalizing and populating them based on the entity data.
    * @param fields - The list of field schemas to normalize.
    * @param entity - The entity containing field options.
    * @returns A promise resolving to an array of updated field schemas.
    */
   async processFieldOptions(fields: FieldSchema[], entity: Entity): Promise<FieldSchema[]> {
      const normalizedFields = normalizeFieldsSchema(fields);

      for (const field of normalizedFields) {
         if (field.type === 'SELECT') {
            if (field.isEnum) {
               const options = (entity[field.name + 'List'] || []) as string[];
               field.options = options.map((option) => {
                  const displayValue = this.translator.instant(
                     capitalize(field.name) + '.' + option
                  );
                  if (!displayValue) {
                     console.warn(
                        `Translation for key "${capitalize(field.name)}.${option}" not found`
                     );
                  }
                  return {
                     id: option,
                     displayValue: this.translator.instant(capitalize(field.name) + '.' + option)
                  };
               });
            } else {
               field.options = (entity[field.name + 'List'] || []) as SelectOption[];
            }
         }
      }

      return normalizedFields;
   }
}
