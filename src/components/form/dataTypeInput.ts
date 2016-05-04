import IAttributes = angular.IAttributes;
import INgModelController = angular.INgModelController;
import gettextCatalog = angular.gettext.gettextCatalog;
import IScope = angular.IScope;
import { DataType } from '../../services/dataTypes';
import { resolveValidator } from './validators';
import { module as mod }  from './module';
import { LanguageService } from '../../services/languageService';

interface DataTypeInputAttributes extends IAttributes {
  datatypeInput: DataType;
}

export function placeholderText(dataType: DataType, gettextCatalog: gettextCatalog) {
  const validator = resolveValidator(dataType);
  const placeholder = gettextCatalog.getString('Input') + ' ' + gettextCatalog.getString(dataType).toLowerCase() + '...';
  return validator.format ? placeholder + ` (${validator.format})` : placeholder;
};

mod.directive('datatypeInput', /* @ngInject */ (languageService: LanguageService, gettextCatalog: gettextCatalog) => {
  return {
    restrict: 'EA',
    require: 'ngModel',
    link($scope: IScope, element: JQuery, attributes: DataTypeInputAttributes, ngModel: INgModelController) {
      if (!attributes.datatypeInput) {
        throw new Error('Data type must be defined');
      }

      const setPlaceholder = () => element.attr('placeholder', placeholderText(attributes.datatypeInput, gettextCatalog));

      $scope.$watch(() => languageService.UILanguage, setPlaceholder);

      function initialize(dataType: DataType, oldDataType: DataType) {
        setPlaceholder();

        if (oldDataType) {
          delete ngModel.$validators[oldDataType];
          ngModel.$setValidity(oldDataType, true);
        }

        ngModel.$validators[dataType] = resolveValidator(dataType);
        ngModel.$validate();
      }

      initialize(attributes.datatypeInput, null);
      $scope.$watch<DataType>(() => attributes.datatypeInput, initialize);
    }
  };
});
