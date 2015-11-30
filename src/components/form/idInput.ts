import IAttributes = angular.IAttributes;
import INgModelController = angular.INgModelController;
import IScope = angular.IScope;
import IQService = angular.IQService;
import { pascalCase, camelCase } from 'change-case';
import { ValidatorService } from '../../services/validatorService';
import { Group, Model, Class, Predicate } from '../../services/entities';

export const mod = angular.module('iow.components.form');

mod.directive('idInput', ($q: IQService, validatorService: ValidatorService) => {
  'ngInject';
  return {
    scope: {
      old: '=',
    },
    restrict: 'A',
    require: 'ngModel',
    link($scope: IdInputScope, element: JQuery, attributes: IAttributes, modelController: INgModelController) {
      let prefix = '';

      const updateOnBlur = { updateOn: 'blur' };

      if (modelController.$options) {
        _.assign(modelController.$options, updateOnBlur);
      } else {
        modelController.$options = updateOnBlur;
      }

      modelController.$parsers.push(value => {
        return prefix ? (prefix + ':' + value) : value;
      });

      modelController.$formatters.push(value => {
        if (value) {
          const split = value.split(':');
          prefix = split[0];
          return split[1];
        }
      });

      modelController.$asyncValidators['idAlreadyInUse'] = (modelValue: string) => {
        if ($scope.old && $scope.old.curie !== modelValue) {
          return validatorService.idDoesNotExist($scope.old.withPrefixExpanded(modelValue));
        } else {
          return $q.when(true);
        }
      }
    }
  };
});

interface IdInputScope extends IScope {
  old: Class|Predicate;
}
