import { config } from '../config';
import { module as mod }  from './module';

mod.directive('footer', () => {
  return {
    restrict: 'E',
    template: require('./footer.html'),
    controllerAs: 'ctrl',
    controller: FooterController
  };
});

class FooterController {
  gitHash = config.gitHash;
  gitDate = config.gitDate;
}
