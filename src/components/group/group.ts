import { ILocationService, ILogService, IPromise, IQService } from 'angular';
import * as _ from 'lodash';
import { EditableEntityController, EditableScope, Rights } from '../form/editableEntityController';
import { AddModelModal } from './addModelModal';
import { DeleteConfirmationModal } from '../common/deleteConfirmationModal';
import { LocationService } from '../../services/locationService';
import { GroupService } from '../../services/groupService';
import { ModelService } from '../../services/modelService';
import { UserService } from '../../services/userService';
import { MaintenanceModal } from '../maintenance';
import { Uri } from '../../entities/uri';
import { module as mod }  from './module';
import { Language } from '../../utils/language';
import { ErrorModal } from '../form/errorModal';
import { NotLoggedInModal } from '../form/notLoggedInModal';
import { Group } from '../../entities/group';
import { ModelListItem } from '../../entities/model';
import { KnownModelType } from '../../entities/type';
import { LanguageContext } from '../../entities/contract';
import { config } from '../../config';
import { InteractiveHelp } from '../common/interactiveHelp';

mod.directive('group', () => {
  return {
    restrict: 'E',
    template: require('./group.html'),
    controllerAs: 'ctrl',
    scope: {
      groupId: '='
    },
    bindToController: true,
    controller: GroupController
  };
});

class GroupController extends EditableEntityController<Group> {

  loading: boolean = true;
  groupId: Uri;
  group: Group;
  models: ModelListItem[];
  profiles: ModelListItem[];

  /* @ngInject */
  constructor($scope: EditableScope,
              $q: IQService,
              $log: ILogService,
              private $location: ILocationService,
              locationService: LocationService,
              groupService: GroupService,
              modelService: ModelService,
              userService: UserService,
              private addModelModal: AddModelModal,
              deleteConfirmationModal: DeleteConfirmationModal,
              errorModal: ErrorModal,
              notLoggedInModal: NotLoggedInModal,
              maintenanceModal: MaintenanceModal,
              private interactiveHelp: InteractiveHelp) {
    super($scope, $log, deleteConfirmationModal, errorModal, notLoggedInModal, userService);

    $scope.$watch(() => this.groupId, groupId => {
      this.loading = true;
      $q.all({
          group: groupService.getGroup(groupId),
          models: modelService.getModelsByGroup(groupId)
        })
        .then((result: {group: Group, models: ModelListItem[]}) => {
          this.group = result.group;
          this.models = _.filter(result.models, model => !model.isOfType('profile'));
          this.profiles = _.filter(result.models, model => model.isOfType('profile'));
          locationService.atGroup(this.group);
          this.loading = false;
        }, err => {
          maintenanceModal.open(err);
        });
    });
  }

  canAddModel(): boolean {
    return this.userService.isLoggedIn() && this.belongToGroup();
  }

  addModel(type: KnownModelType) {
    this.addModelModal.open(this.groupId, type).then((result: {prefix: string, label: string, language: Language[], redirect?: Uri}) => {
      this.$location.path('/newModel');
      this.$location.search({ prefix: result.prefix, label: result.label, language: result.language, group: this.groupId.uri, type, redirect: result.redirect && result.redirect.uri });
    });
  };

  selectModel(model: ModelListItem) {
    this.$location.url(model.iowUrl());
  }

  create(_entity: Group): IPromise<any> {
    throw new Error('Not supported');
  }

  update(_entity: Group, _oldEntity: Group): IPromise<any> {
    throw new Error('Not supported');
  }

  remove(_entity: Group): IPromise<any> {
    throw new Error('Not supported');
  }

  rights(): Rights {
    return {
      edit: () => false,
      remove: () => false
    };
  }

  getEditable(): Group {
    return this.group;
  }

  setEditable(editable: Group) {
    this.group = editable;
  }

  canAskForRights(): boolean {
    return this.userService.isLoggedIn() && !this.belongToGroup();
  }

  belongToGroup(): boolean {
    return this.userService.user.isMemberOf(this.getGroup());
  }

  getGroup(): Group {
    return this.group;
  }

  getContext(): LanguageContext {
    return this.group;
  }

  canStartHelp() {
    return !config.production && this.canAddModel();
  }

  startHelp() {

    const editableMargin = { left: 15, right: 15, top: 5, bottom: -10 };

    this.interactiveHelp.open({ stories: [
      {
        popoverTo: () => angular.element('#add-library-button'),
        focusTo: () => ({
          element: angular.element('#add-library-button')
        }),
        popoverPosition: 'left',
        title: 'Add library',
        content: 'Diipadaa',
        nextCondition: 'click'
      },
      {
        popoverTo: () => angular.element('.modal-dialog [data-title="Prefix"] input'),
        focusTo: () => ({
          element: angular.element('.modal-dialog [data-title="Prefix"]'),
          margin: editableMargin
        }),
        popoverPosition: 'left',
        title: 'Prefix',
        content: 'Prefix info',
        nextCondition: 'valid-input'
      },
      {
        popoverTo: () => angular.element('editable-multiple-language-select .multi-input'),
        focusTo: () => ({
          element: angular.element('editable-multiple-language-select div.editable-wrap'),
          margin: Object.assign({}, editableMargin, { bottom: 10 })
        }),
        popoverPosition: 'left',
        title: 'Model languages',
        content: 'Diipadaa',
        nextCondition: 'explicit'
      },
      {
        popoverTo: () => angular.element('.modal-dialog [data-title="Library label"] input'),
        focusTo: () => ({
          element: angular.element('.modal-dialog [data-title="Library label"]'),
          margin: editableMargin
        }),
        popoverPosition: 'left',
        title: 'Library label',
        content: 'Library label info',
        nextCondition: 'valid-input'
      },
      {
        popoverTo: () => angular.element('.modal-dialog [data-title="Namespace redirection"] input'),
        focusTo: () => ({
          element: angular.element('.modal-dialog [data-title="Namespace redirection"]'),
          margin: editableMargin
        }),
        popoverPosition: 'left',
        title: 'Namespace redirection',
        content: 'Diipadaa',
        nextCondition: 'valid-input'
      },
      {
        popoverTo: () => angular.element('button.create'),
        focusTo: () => ({
          element: angular.element('button.create')
        }),
        popoverPosition: 'left',
        title: 'Create new',
        content: 'Diipadaa',
        nextCondition: 'click'
      }
    ]});
  }
}
