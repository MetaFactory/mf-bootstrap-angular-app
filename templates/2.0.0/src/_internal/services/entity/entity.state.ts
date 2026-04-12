import type { DataTableSorting, EntityListItemDto, EntityStateEntity } from '../../types';
import { getFilterStorageKey, getSortingStorageKey, readLocalStorage } from '../../utils';

export function insatiateEntityState<ITEM extends EntityListItemDto>(
   entityName: string
): EntityStateEntity<ITEM> {
   const filter = getCurrentPageFilter(entityName);
   const sorting = readLocalStorage<DataTableSorting>(getSortingStorageKey(entityName));

   return {
      list: [],
      filter,
      sorting,
      total: 0,
      hasMore: false
   };
}

export function getCurrentPageFilter(entityName?: string) {
   const currentUrl = window.location.href;
   const url = new URL(currentUrl);
   const params = new URLSearchParams(url.search);
   const filterParam = params.get('filter');

   if (filterParam) {
      try {
         return JSON.parse(atob(filterParam));
      } catch (e) {}
   }

   return entityName ? readLocalStorage(getFilterStorageKey(entityName), {}) : null;
}
