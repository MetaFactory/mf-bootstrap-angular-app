import { CommonConfig, WeekDay } from '../types';
import { readLocalStorage } from '../utils';

export const defaultCommonConfig: CommonConfig = {
   devTools: true,
   entityEmptyValueText: '-',
   weekStartDay: WeekDay.Monday,
   production: false,
   listDefaultPageSize: 20,

   api: {
      baseUrl: '',
      mocked: [],
      token: readLocalStorage('token', ''),
      accountApiTimeout: 2000, // ms
      defaultTimeout: 30000, // ms
      mockDataPath: 'assets/mocks'
   },

   dateFormat: 'yyyy-MM-dd',
   defaultLanguage: readLocalStorage('language', 'en'),
   selectNoSearchMaxItems: 6,
   fileDownloadTimeout: 30, // seconds

   phoneNumberDisplayValuePrefix: '📞 ',
   emailDisplayValuePrefix: '✉️ ',

   screenSize: {
      sm: 500,
      md: 960,
      lg: 1200
   },

   components: {
      select: {
         defaultMaxWidth: 300,
         defaultMaxheight: 420
      }
   },

   version: '-',

   languages: [
      { displayValue: 'English', id: 'en' },
      { displayValue: 'Dutch', id: 'nl' }
   ],

   loginTitle: 'Welcome',
   accountUrlMobile: '/account',

   darkLogo: 'assets/logo-dark.png',
   lightLogo: 'assets/logo-light.png'
};
