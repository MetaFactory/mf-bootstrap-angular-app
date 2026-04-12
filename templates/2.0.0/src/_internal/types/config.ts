import { InjectionToken } from '@angular/core';
import { SelectOption } from '.';
import { FormAction } from './schema';

// First, define types for nested objects if needed
type ApiConfig = {
   baseUrl: string;
   token: string | null;
   accountApiTimeout: number; // ms
   defaultTimeout: number; // ms

   /**
    * Default: 'assets/mocks'
    */
   mockDataPath: string;
   mocked: string[];
};

type ScreenSizeConfig = {
   sm: number;
   md: number;
   lg: number;
};

type SelectComponentConfig = {
   defaultMaxWidth: number;
   defaultMaxheight: number;
};

type ComponentsConfig = {
   select: SelectComponentConfig;
};

// Enum for WeekDay to make the config more type-safe and clear
export enum WeekDay {
   Sunday = 0,
   Monday = 1,
   Tuesday = 2,
   Wednesday = 3,
   Thursday = 4,
   Friday = 5,
   Saturday = 6
}

// Config type definition
export type CommonConfig = {
   devTools: boolean;
   entityEmptyValueText: string;
   weekStartDay: WeekDay;
   api: ApiConfig;
   dateFormat: string;
   production: boolean;
   defaultLanguage: string;
   selectNoSearchMaxItems: number;
   screenSize: ScreenSizeConfig;
   components: ComponentsConfig;

   userPreferenceAction?: FormAction;
   userProfileAction?: FormAction;
   version: string;
   languages: SelectOption[];
   loginTitle: string;
   accountUrlMobile: string;
   notificationLink?: string;
   userPhoto?: string;
   darkLogo: string;
   lightLogo: string;
   fileDownloadTimeout: number;
   listDefaultPageSize: number;
   phoneNumberDisplayValuePrefix: string;
   emailDisplayValuePrefix: string;
};

export const CONFIG_TOKEN = new InjectionToken<CommonConfig>('ConfigToken');
