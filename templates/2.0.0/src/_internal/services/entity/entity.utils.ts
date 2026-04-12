import { HttpResponse } from '@angular/common/http';
import { createSlice } from '@reduxjs/toolkit';
import { saveAs } from 'file-saver';
import { entityReducerBase, insatiateEntityState } from '.';
import { EntityListItemDto, EntityState } from '..';
import { defaultCommonConfig } from '../../config';
import { DataTableSorting, EntityServiceInfo, FieldSchema, IEntityService } from '../../types';

export function generateDynamicEntitySlices(dynamicServices: EntityServiceInfo[]) {
   const dynamicSlices = dynamicServices.map((service) =>
      createSlice({
         name: service.name,

         initialState: {
            entity: insatiateEntityState(service.name)
         },

         reducers: {
            ...entityReducerBase<EntityListItemDto, EntityState<EntityListItemDto>>()
         }
      })
   );
   return dynamicSlices;
}

function createQuery(field: FieldSchema, value: any) {
   switch (field.type) {
      case 'SELECT':
         let key;
         if (field.isEnum) {
            key = field.multi ? field.name + 'List' : field.name;
         } else {
            key = field.multi ? field.name + 'IdList' : field.name + 'Id';
         }
         return `${key}=${value.id}`;

      case 'BOOLEAN':
         return `${field.name}=${value.id}`;

      default:
         return `${field.name}=${value}`;
   }
}

export function createListQuery(
   fieldsSchema: FieldSchema[] | undefined,
   filter: any,
   sorting: DataTableSorting | null,
   page: number,
   pageSize?: number
) {
   const parts = [];
   // Sorting
   if (sorting?.field) {
      parts.push(`sort=${sorting.field},${sorting.order}`);
   }

   // Pagination
   parts.push(`page=${page}&size=${pageSize ?? defaultCommonConfig.listDefaultPageSize}`);

   // Filter
   if (fieldsSchema) {
      for (const field of fieldsSchema) {
         const value = filter[field.name!];
         if (value == null) continue;

         if (Array.isArray(value)) {
            value.forEach((val) => parts.push(createQuery(field, val)));
         } else {
            parts.push(createQuery(field, value));
         }
      }
   }

   const query = parts.length ? '?' + parts.join('&') : '';
   return query;
}

export async function downloadFile(params: {
   url: string;
   service: IEntityService;
   filter?: unknown;
   fieldsSchema?: FieldSchema[];
   fileName?: string;
   timeout?: number; // seconds
}) {
   const { url, service, filter, fieldsSchema } = params;
   const query = filter ? createListQuery(fieldsSchema, filter, null, 0) : '';
   const response = await service.request<HttpResponse<Blob>>(url + query, {
      responseType: 'blob',
      observe: 'response',
      timeout: (params.timeout ?? defaultCommonConfig.fileDownloadTimeout) * 1000
   });

   const contentDisposition = response.headers.get('Content-Disposition');
   const fileName = contentDisposition
      ? contentDisposition.split('filename=')[1].replace(/"/g, '')
      : (params.fileName ?? '');

   saveAs(response.body as Blob, fileName);
}
