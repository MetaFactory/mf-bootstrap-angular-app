import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { NavItem, Theme } from '../../types';
import { GeneralState, initialState } from './general.state';

export const generalSlice = createSlice({
   name: 'general',
   initialState,
   reducers: {
      isMobileSet(state, action: PayloadAction<boolean>) {
         state.isMobile = action.payload;
      },

      detailsSectionPathSet(state, action: PayloadAction<string | undefined>) {
         state.detailsSectionPath = action.payload;
      },

      modalFormPathSet(state, action: PayloadAction<string | undefined>) {
         state.modalFormPath = action.payload;
      },

      collapseSidebarSet(state, action: PayloadAction<boolean>) {
         state.collapseSidebar = action.payload;
      },

      setDefaults(state, action: PayloadAction<Partial<GeneralState>>) {
         Object.assign(state, action.payload);
      },

      navItemsSet(state, action: PayloadAction<NavItem[]>) {
         state.navItems = action.payload;
      },

      activeNotificationsCountSet(state, action: PayloadAction<number>) {
         state.activeNotificationsCount = action.payload;
      },

      messageBoxSet(state, action: PayloadAction<string>) {
         state.messageBox = action.payload;
      },

      themeSet(state, action: PayloadAction<Theme>) {
         state.theme = action.payload;
      },

      isDarkSet(state, action: PayloadAction<boolean>) {
         state.isDark = action.payload;
      }
   }
});

export const generalReducer = { general: generalSlice.reducer };

export const {
   isMobileSet,
   detailsSectionPathSet,
   modalFormPathSet,
   collapseSidebarSet,
   setDefaults,
   navItemsSet,
   activeNotificationsCountSet,
   messageBoxSet,
   themeSet,
   isDarkSet
} = generalSlice.actions;
