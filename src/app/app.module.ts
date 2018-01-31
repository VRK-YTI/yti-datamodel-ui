import * as angular from 'angular';
import { animate, ICompileProvider, ILocationProvider, ILogProvider, ui } from 'angular';
import { routeConfig } from './routes';
import { module as commonModule } from './components/common';
import { module as editorModule } from './components/editor';
import { module as visualizationModule } from './components/visualization';
import { module as formModule } from './components/form';
import { module as modelModule } from './components/model';
import { module as navigationModule } from './components/navigation';
import { module as userModule } from './components/user';
import { module as informationModule } from './components/information';
import { module as filterModule } from './components/filter';
import { module as componentsModule } from './components';
import { module as servicesModule } from './services';
import { module as helpModule } from './help';
import { BrowserModule } from '@angular/platform-browser';
import { downgradeComponent, downgradeInjectable, UpgradeModule } from '@angular/upgrade/static';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { YtiCommonModule } from 'yti-common-ui';
import { config } from 'config';
import { AUTHENTICATED_USER_ENDPOINT } from 'yti-common-ui/services/user.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {
  MissingTranslationHandler, MissingTranslationHandlerParams, TranslateLoader, TranslateModule,
  TranslateService
} from 'ng2-translate';
import { Observable } from 'rxjs/Observable';
import { availableUILanguages } from './types/language';

import { LoginModalService } from 'yti-common-ui/components/login-modal.component';
import { FooterComponent } from 'yti-common-ui/components/footer.component';
import { LOCALIZER } from 'yti-common-ui/pipes/translate-value.pipe';
import { Localizer as AngularLocalizer } from 'yti-common-ui/types/localization';
import { DefaultAngularLocalizer, LanguageService } from './services/languageService';
import IInjectorService = angular.auto.IInjectorService;
import IAnimateProvider = animate.IAnimateProvider;
import ITooltipProvider = ui.bootstrap.ITooltipProvider;
import { MenuComponent } from 'yti-common-ui/components/menu.component';
import { AjaxLoadingIndicatorComponent } from 'yti-common-ui/components/ajax-loading-indicator.component';
import { AjaxLoadingIndicatorSmallComponent } from 'yti-common-ui/components/ajax-loading-indicator-small.component';
import { FilterDropdownComponent } from 'yti-common-ui/components/filter-dropdown.component';
import { StatusComponent } from 'yti-common-ui/components/status.component';
import { DropdownComponent } from 'yti-common-ui/components/dropdown.component';

require('angular-gettext');
require('checklist-model');
require('ngclipboard');

export const localizationStrings: { [key: string]: { [key: string]: string } } = {};

for (const language of availableUILanguages) {
  localizationStrings[language] = Object.assign({},
    require(`../../po/${language}.po`),
    require(`yti-common-ui/po/${language}.po`)
  );
}

Object.freeze(localizationStrings);

export function resolveAuthenticatedUserEndpoint() {
  return config.apiEndpointWithName('user');
}

export function createTranslateLoader(): TranslateLoader {
  return {
    getTranslation: (lang: string) => {
      return Observable.of(localizationStrings[lang])
    }
  };
}

export function createMissingTranslationHandler(): MissingTranslationHandler {
  return {
    handle: (params: MissingTranslationHandlerParams) => {
      if (params.translateService.currentLang === 'en') {
        return params.key;
      } else {
        return '[MISSING]: ' + params.key;
      }
    }
  };
}

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    UpgradeModule,
    YtiCommonModule,
    TranslateModule.forRoot({ provide: TranslateLoader, useFactory: createTranslateLoader }),
    NgbModule.forRoot(),
  ],
  declarations: [
    StatusComponent // FIXME should be declared in YtiCommonModule
  ],
  entryComponents: [
    FooterComponent,
    MenuComponent,
    AjaxLoadingIndicatorComponent,
    AjaxLoadingIndicatorSmallComponent,
    DropdownComponent,
    FilterDropdownComponent,
    StatusComponent
  ],
  providers: [
    { provide: AUTHENTICATED_USER_ENDPOINT, useFactory: resolveAuthenticatedUserEndpoint },
    { provide: MissingTranslationHandler, useFactory: createMissingTranslationHandler },
    {
      provide: LanguageService,
      useFactory(injector: IInjectorService): AngularLocalizer {
        return new DefaultAngularLocalizer(injector.get<LanguageService>('languageService'));
      },
      deps: ['$injector']
    },
    { provide: LOCALIZER,
      useFactory(languageService: LanguageService): AngularLocalizer {
        return new DefaultAngularLocalizer(languageService);
      },
      deps: [LanguageService]
    }
  ]
})
export class AppModule {

  constructor(private upgrade: UpgradeModule) {
  }

  ngDoBootstrap() {
    this.upgrade.bootstrap(document.body, ['iow-ui'], { strictDi: true });
  }
}

const mod = angular.module('iow-ui', [
  require('angular-animate'),
  require('angular-messages'),
  require('angular-route'),
  require('ui-bootstrap4'),
  'gettext',
  'checklist-model',
  'ngclipboard',
  commonModule.name,
  editorModule.name,
  visualizationModule.name,
  formModule.name,
  modelModule.name,
  navigationModule.name,
  userModule.name,
  informationModule.name,
  filterModule.name,
  componentsModule.name,
  servicesModule.name,
  helpModule.name
]);

mod.directive('appMenu', downgradeComponent({component: MenuComponent}));
mod.directive('appFooter', downgradeComponent({
  component: FooterComponent,
  inputs: ['title'],
  outputs: ['informationClick']
}));

mod.directive('ajaxLoadingIndicator', downgradeComponent({component: AjaxLoadingIndicatorComponent}));
mod.directive('ajaxLoadingIndicatorSmall', downgradeComponent({component: AjaxLoadingIndicatorSmallComponent}));
mod.directive('appDropdown', downgradeComponent({
  component: DropdownComponent,
  inputs: ['options', 'showNullOption', 'placement']
}));
mod.directive('appFilterDropdown', downgradeComponent({
  component: FilterDropdownComponent,
  inputs: ['options', 'filterSubject']
}));
mod.directive('appStatus', downgradeComponent({component: StatusComponent}));

mod.factory('translateService', downgradeInjectable(TranslateService));
mod.factory('loginModal', downgradeInjectable(LoginModalService));
mod.factory('localizationStrings', () => localizationStrings);

mod.config(routeConfig);

mod.config(($locationProvider: ILocationProvider,
            $logProvider: ILogProvider,
            $compileProvider: Angular16ICompileProvider,
            $animateProvider: IAnimateProvider,
            $uibTooltipProvider: ITooltipProvider) => {

  $locationProvider.html5Mode(true);
  $logProvider.debugEnabled(false);

  // Breaking change in angular 1.5 -> 1.6 consider adopting the $onInit style which is now default
  $compileProvider.preAssignBindingsEnabled(true);
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(|blob|https?|mailto):/);

  // enable angular-animate framework when 'ng-animate-enabled' class is added to animated element
  $animateProvider.classNameFilter(/ng-animate-enabled/);

  $uibTooltipProvider.options({ appendToBody: true });
  $uibTooltipProvider.setTriggers({'mouseenter': 'mouseleave click'});
});


mod.run((gettextCatalog: any) => {

  gettextCatalog.debug = true;

  for (const language of availableUILanguages) {
    gettextCatalog.setStrings(language, localizationStrings[language]);
  }
});

// TODO replace with angular 1.6 @types when available
interface Angular16ICompileProvider extends ICompileProvider {
  preAssignBindingsEnabled(value: boolean): void;
}
