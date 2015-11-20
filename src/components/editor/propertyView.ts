import IAttributes = angular.IAttributes;
import ILocaleService = angular.ILocaleService;
import ILocationService = angular.ILocationService;
import IScope = angular.IScope;
import ITimeoutService = angular.ITimeoutService;
import { Property, Predicate, Model } from '../../services/entities';
import { ClassViewController } from './classView';
import { PredicateService } from '../../services/predicateService';
import { ModelCache } from '../../services/modelCache';

export const mod = angular.module('iow.components.editor');

mod.directive('propertyView', ($location: ILocationService, $timeout: ITimeoutService) => {
  'ngInject';
  return {
    scope: {
      property: '=',
      model: '='
    },
    restrict: 'E',
    template: require('./propertyView.html'),
    controllerAs: 'ctrl',
    bindToController: true,
    require: ['propertyView', '^classForm', '?^classView'],
    link($scope: PropertyViewScope, element: JQuery, attributes: IAttributes, controllers: any[]) {
      const controller = controllers[0];
      $scope.editableController = controllers[2];
      controllers[1].registerPropertyView(controller.property.id, controller);

      controller.scroll = () => {
        const scrollTop = element.offset().top;
        if (scrollTop === 0) {
          $timeout(controller.scroll, 100);
        } else {
          jQuery('html, body').animate({scrollTop}, 'slow');
        }
      };

      if ($location.search().property === controller.property.id) {
        controller.openAndScrollTo();
      }
    },
    controller: PropertyViewController
  }
});

interface PropertyViewScope extends IScope {
  editableController: ClassViewController;
}

export class PropertyViewController {

  property: Property;
  model: Model;
  predicate: Predicate;
  isOpen: boolean;
  scroll: () => void;

  /* @ngInject */
  constructor($scope: IScope, $location: ILocationService, predicateService: PredicateService, private modelCache: ModelCache) {
    $scope.$watch(() => this.isOpen, open => {
      if (open) {
        $location.search('property', this.property.id);

        if (!this.predicate) {
          predicateService.getPredicate(this.property.predicateId).then(predicate => {
            this.predicate = predicate;
          });
        }
      }
    });
  }

  linkToValueClass() {
    return this.model.linkToCurie('class', this.property.valueClass, this.modelCache);
  }

  linkToExternalValueClass() {
    return this.model.linkToExternalCurie(this.property.valueClass, this.modelCache);
  }

  openAndScrollTo() {
    this.isOpen = true;
    this.scroll();
  }
}
