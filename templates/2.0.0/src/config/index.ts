import { defaultCommonConfig } from '@common/config';
import { readLocalStorage } from '@common/utils';
import { mocked } from 'src/assets/mocked';
import { userProfileAction } from 'src/schema';
import packageInfo from '../../package.json';

const hostname = window.location.hostname;
const apiBaseUrl = window.location.origin;
const production = !['localhost', '127.0.0.1', '0.0.0.0'].includes(hostname);

const urlParams = new URLSearchParams(window.location.search);
const tokenFromUrl = urlParams.get('token');
if (tokenFromUrl) {
   localStorage.setItem('token', tokenFromUrl);
   window.history.replaceState({}, '', window.location.pathname);
}

export const config = {
   ...defaultCommonConfig,

   apiBaseUrl,
   production,
   loginTitle: 'Login to lumina-book',
   listDefaultPageSize: 50,

   languages: [],

   api: {
      ...defaultCommonConfig.api,
      baseUrl: apiBaseUrl,
      token: tokenFromUrl || readLocalStorage('token', ''),
      mocked: production ? [] : mocked
   },

   version: packageInfo.version,

   userProfileAction: userProfileAction,
   userPhoto: readLocalStorage('user-photo', '')
};

Object.freeze(config);
console.log(`LuminaBook version ${config.version}`);
// console.log(`API server: ${config.api.baseUrl}`);
