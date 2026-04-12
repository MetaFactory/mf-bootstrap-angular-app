import { PayloadAction } from '@reduxjs/toolkit';
import type { DataTableSorting, EntityListItemDto, EntityState } from '../../types';

export function entityReducerBase<
   ITEM extends EntityListItemDto,
   STATE extends EntityState<ITEM>
>() {
   return {
      entityDeleted: (state: STATE, action: PayloadAction<number>) => {
         state.entity.list = state.entity.list.filter((entity) => entity.id !== action.payload);
      },

      entityUpdated: (state: STATE, action: PayloadAction<ITEM>) => {
         const story = state.entity.list.find((entity) => entity.id === action.payload.id);
         if (story) {
            Object.assign(story, action.payload);
         }
      },

      sortingSet: (state: STATE, action: PayloadAction<DataTableSorting | null>) => {
         state.entity.sorting = action.payload;
      },

      filtersSet: (state: STATE, action: PayloadAction<unknown>) => {
         state.entity.filter = action.payload as Record<string, unknown>;
      },

      entityListSet: (
         state: STATE,
         action: PayloadAction<{
            list: ITEM[];
            append: boolean;
            total: number;
            hasMore: boolean;
         }>
      ) => {
         if (action.payload.append) {
            state.entity.list.push(...action.payload.list);
         } else {
            state.entity.list = action.payload.list;
         }

         state.entity.total = action.payload.total;
         state.entity.hasMore = action.payload.hasMore;
      }
   };
}

export type EntityReducerBase<
   ITEM extends EntityListItemDto,
   STATE extends EntityState<ITEM>
> = ReturnType<typeof entityReducerBase<ITEM, STATE>>;
