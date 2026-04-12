export type MultiLanguageText = { [language: string]: string };

/*
 * Temporary id for new items until they are saved
 */

export type NavItem = {
   title?: string;
   translationBase?: string;
   icon?: string;
   path?: string;
   items?: SidebarItem[];

   /**
    * default must be 'all'
    */
   displayMode?: 'all' | 'desktop' | 'mobile';
   separator?: boolean;
   css?: string;
};

export type PathAuthority = {
   /**
    * Path to the nav item, it supports * wildcard, like "/setting/*"" which matched the addresses /setting or /setting/1
    */
   path: string;

   /**
    * User roles, e.g. ADMIN, ROLE_ADMIN or etc
    */
   authority: string | string[];
};

export type SidebarItem = {
   title?: string;
   path?: string;
   icon?: string;
   hidden?: boolean;
   separator?: boolean;
   css?: string;
};

export type ProgressStatus = 'idle' | 'in-progress' | 'failed';

export type ColorScheme =
   | 'primary'
   | 'secondary'
   | 'warning'
   | 'danger'
   | 'success'
   | 'info'
   | 'light'
   | 'dark';

export type Theme = 'dark' | 'light' | 'system';

export type EntityServiceInfo = {
   name: string; // the Redux service name
   path: string; // the API prefix path for the specific entity
};

/**
 * Used to keep the state of form when it is waiting for an API to be called, e.g. Saving an entity form.
 */
export type FormActionState = 'Running' | 'Idle' | 'Failure';
