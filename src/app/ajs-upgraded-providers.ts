import { ILocationService, IRootScopeService, route } from 'angular';
import { ModelService } from './services/modelService';
import { NotificationModal } from './components/common/notificationModal';
import { ConfirmationModal } from './components/common/confirmationModal';
import { LanguageService } from './services/languageService';
import { ModelPageHelpService } from './help/providers/modelPageHelpService';
import { gettextCatalog as GettextCatalog } from 'angular-gettext';
import { DisplayItemFactory } from './components/form/displayItemFactory';
import { ShowClassInfoModal } from './components/editor/showClassInfoModal';
import { ShowPredicateInfoModal } from './components/editor/showPredicateInfoModal';
import { OrganizationService } from './services/organizationService';
import { UserRoleService } from './services/userRoleService';
import { ConfigService } from './services/configService';
import IInjectorService = angular.auto.IInjectorService;
import { LocationService } from './services/locationService';
import { AuthorizationManagerService } from './services/authorizationManagerService';

// NOTE: In normal case the "wrappers" should not be needed, but I could not figure out the way to make it work with the interfaces.

export class ModelServiceWrapper {
  constructor(public modelService: ModelService) {
  }
}

export function modelServiceFactory(i: IInjectorService) {
  return new ModelServiceWrapper(i.get('modelService'))
}

export const modelServiceProvider = {
  provide: ModelServiceWrapper,
  useFactory: modelServiceFactory,
  deps: ['$injector']
};


export class LocationServiceWrapper {
  constructor(public locationService: ILocationService) {
  }
}

export function locationServiceFactory(i: IInjectorService) {
  return new LocationServiceWrapper(i.get('$location'));
}

export const locationServiceProvider = {
  provide: LocationServiceWrapper,
  useFactory: locationServiceFactory,
  deps: ['$injector']
};


export class RouteServiceWrapper {
  constructor(public routeService: route.IRouteService) {
  }
}

export function routeServiceFactory(i: IInjectorService) {
  return new RouteServiceWrapper(i.get('$route'));
}

export const routeServiceProvider = {
  provide: RouteServiceWrapper,
  useFactory: routeServiceFactory,
  deps: ['$injector']
};


export class ScopeWrapper {
  constructor(public scope: IRootScopeService) {
  }
}

export function scopeFactory(i: IInjectorService) {
  return new ScopeWrapper(i.get('$rootScope'));
}

export const scopeProvider = {
  provide: ScopeWrapper,
  useFactory: scopeFactory,
  deps: ['$injector']
};


export function notificationModalFactory(i: IInjectorService) {
  return i.get('notificationModal');
}

export const notificationModalProvider = {
  provide: NotificationModal,
  useFactory: notificationModalFactory,
  deps: ['$injector']
};


export function confirmationModalFactory(i: IInjectorService) {
  return i.get('confirmationModal');
}

export const confirmationModalProvider = {
  provide: ConfirmationModal,
  useFactory: confirmationModalFactory,
  deps: ['$injector']
};

export function languageServiceFactory(i: IInjectorService) {
  return i.get('languageService');
}

export const languageServiceProvider = {
  provide: LanguageService,
  useFactory: languageServiceFactory,
  deps: ['$injector']
};

export function modelPageHelpServiceFactory(i: IInjectorService) {
  return i.get('modelPageHelpService');
}

export const modelPageHelpServiceProvider = {
  provide: ModelPageHelpService,
  useFactory: modelPageHelpServiceFactory,
  deps: ['$injector']
};

export class GettextCatalogWrapper {
  constructor(public gettextCatalog: GettextCatalog) {
  }
}

export function gettextCatalogFactory(i: IInjectorService) {
  return new GettextCatalogWrapper(i.get('gettextCatalog'));
}

export const gettextCatalogProvider = {
  provide: GettextCatalogWrapper,
  useFactory: gettextCatalogFactory,
  deps: ['$injector']
};

export function displayItemFactoryFactory(i: IInjectorService) {
  return i.get('displayItemFactory');
}

export const displayItemFactoryProvider = {
  provide: DisplayItemFactory,
  useFactory: displayItemFactoryFactory,
  deps: ['$injector']
};

export function showClassInfoModalFactory(i: IInjectorService) {
  return i.get('showClassInfoModal');
}

export const showClassInfoModalProvider = {
  provide: ShowClassInfoModal,
  useFactory: showClassInfoModalFactory,
  deps: ['$injector']
};

export function showPredicateInfoModalFactory(i: IInjectorService) {
  return i.get('showPredicateInfoModal');
}

export const showPredicateInfoModalProvider = {
  provide: ShowPredicateInfoModal,
  useFactory: showPredicateInfoModalFactory,
  deps: ['$injector']
};


export class OrganizationServiceWrapper {
  constructor(public organizationService: OrganizationService) {
  }
}

export function organizationServiceFactory(i: IInjectorService) {
  return new OrganizationServiceWrapper(i.get('organizationService'))
}

export const organizationServiceProvider = {
  provide: OrganizationServiceWrapper,
  useFactory: organizationServiceFactory,
  deps: ['$injector']
};


export class UserRoleServiceWrapper {
  constructor(public userRoleService: UserRoleService) {
  }
}

export function userRoleServiceFactory(i: IInjectorService) {
  return new UserRoleServiceWrapper(i.get('userRoleService'))
}

export const userRoleServiceProvider = {
  provide: UserRoleServiceWrapper,
  useFactory: userRoleServiceFactory,
  deps: ['$injector']
};


export class ConfigServiceWrapper {
  constructor(public configService: ConfigService) {
  }
}

export function configServiceFactory(i: IInjectorService) {
  return new ConfigServiceWrapper(i.get('configService'))
}

export const configServiceProvider = {
  provide: ConfigServiceWrapper,
  useFactory: configServiceFactory,
  deps: ['$injector']
};


export class DatamodelLocationServiceWrapper {
  constructor(public locationService: LocationService) {
  }
}

export function datamodelLocationServiceFactory(i: IInjectorService) {
  return new DatamodelLocationServiceWrapper(i.get('locationService'));
}

export const datamodelLocationServiceProvider = {
  provide: DatamodelLocationServiceWrapper,
  useFactory: datamodelLocationServiceFactory,
  deps: ['$injector']
};

export class AuthorizationManagerServiceWrapper {
  constructor(public authorizationManagerService: AuthorizationManagerService) {
  }
}

export function authorizationManagerServiceFactory(i: IInjectorService) {
  return new AuthorizationManagerServiceWrapper(i.get('authorizationManagerService'))
}

export const authorizationManagerServiceProvider = {
  provide: AuthorizationManagerServiceWrapper,
  useFactory: authorizationManagerServiceFactory,
  deps: ['$injector']
};
