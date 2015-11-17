module.exports = function modelLanguageChooser() {
  'ngInject';
  return {
    scope: {
    },
    restrict: 'E',
    template: require('./modelLanguageChooser.html'),
    controller($scope, languageService) {
      'ngInject';
      $scope.currentLanguage = languageService.getModelLanguage;
      $scope.setLanguage = languageService.setModelLanguage;
      $scope.languages = languageService.getAvailableLanguages();
    }
  };
};
