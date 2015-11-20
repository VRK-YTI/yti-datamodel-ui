import * as _ from 'lodash';
import IPromise = angular.IPromise;
import IScope = angular.IScope;
import ILocationService = angular.ILocationService;
import IRouteParamsService = angular.route.IRouteParamsService;
import IQService = angular.IQService;
import { ClassService } from '../../services/classService';
import { LanguageService } from '../../services/languageService';
import { LocationService } from '../../services/locationService';
import { ModelService } from '../../services/modelService';
import { PredicateService } from '../../services/predicateService';
import { UserService } from '../../services/userService';
import { glyphIconClassForType, collectIds } from '../../services/utils';
import { Class, Attribute, Predicate, PredicateListItem, ClassListItem, Association, Model, Type, Concept, ConceptSuggestion, Property, WithIdAndType, Uri } from '../../services/entities';
import { ConfirmationModal } from '../common/confirmationModal';
import { SearchClassModal } from '../editor/searchClassModal';
import { SearchPredicateModal } from '../editor/searchPredicateModal';
import { ConceptCreation, isConceptCreation } from '../editor/searchConceptModal';
import { Localizable } from '../../services/entities';

export class ModelController {

  loading = true;
  views: View[] = [];
  selectedItem: WithIdAndType;
  model: Model;
  selection: Class|Predicate;
  classes: ClassListItem[];
  predicates: PredicateListItem[];

  tabs = [
    new Tab('class', () => this.classes, () => this.addClass()),
    new Tab('attribute', () => _.filter(this.predicates, predicate => predicate.type === 'attribute'), () => this.addPredicate('attribute')),
    new Tab('association', () => _.filter(this.predicates, predicate => predicate.type === 'association'), () => this.addPredicate('association'))
  ];

  /* @ngInject */
  constructor(private $scope: IScope,
              private $location: ILocationService,
              private $routeParams: IRouteParamsService,
              private $q: IQService,
              private locationService: LocationService,
              private modelService: ModelService,
              private classService: ClassService,
              private predicateService: PredicateService,
              private userService: UserService,
              private searchClassModal: SearchClassModal,
              private searchPredicateModal: SearchPredicateModal,
              private confirmationModal: ConfirmationModal,
              private languageService: LanguageService) {

    this.init(new RouteData($routeParams));

    $scope.$on('$locationChangeSuccess', () => {
      if ($location.path() === '/models') {
        this.init(new RouteData($location.search()));
      }
    });

    $scope.$watch(() => this.model, (newModel: Model, oldModel: Model) => {
      this.updateLocation();

      // new model creation cancelled
      if (oldModel && !newModel) {
        $location.path('/groups');
        $location.search({urn: $routeParams['Group']});
      }
    });

    $scope.$watch(() => this.selection, () => this.updateLocation());
  }

  init(routeData: RouteData) {
    if (routeData.selected) {
      _.find(this.tabs, tab => tab.type === routeData.selected.type).active = true;
    }

    this.selectedItem = routeData.selected;

    routeData.newModel
      ? this.updateNewModel(routeData.newModel)
      : this.$q.all([
          this.updateModelById(routeData.existingModelId).then(() => this.updateSelectables()),
          this.updateSelectionByTypeAndId(routeData.selected)
        ])
      .then(() => this.loading = false);
  }

  registerView(view: View) {
    this.views.push(view);
  }

  private selectionQueue: WithIdAndType[] = [];

  isSelected(selection: WithIdAndType) {
    return areEqual(selection, this.selectedItem);
  }

  select(listItem: WithIdAndType) {
    const fetchUntilStable: ((selection: WithIdAndType) => IPromise<Class|Predicate>) = item => {
      return this.fetchEntityByTypeAndId(item).then((entity: any) => {
        const last = this.selectionQueue[this.selectionQueue.length - 1];
        if (areEqual(entity, last)) {
          return entity;
        } else {
          return fetchUntilStable(last);
        }
      });
    };

    this.askPermissionWhenEditing(() => {
      this.selectedItem = listItem;
      if (this.selectionQueue.length > 0) {
        this.selectionQueue.push(listItem);
      } else {
        this.selectionQueue.push(listItem);
        fetchUntilStable(listItem).then((selection: Class|Predicate) => {
          this.selectionQueue = [];
          this.updateSelection(selection);
        });
      }
    });
  }

  selectionEdited(oldSelection: WithIdAndType, newSelection: WithIdAndType) {
    this.updateSelectables();
  }

  canEdit(): boolean {
    return this.userService.isLoggedIn();
  }

  selectionDeleted(selection: WithIdAndType) {
    _.remove(this.classes, item => areEqual(item, selection));
    _.remove(this.predicates, item => areEqual(item, selection));
  }

  private updateLocation() {
    if (this.model) {
      this.locationService.atModel(this.model, this.selection);

      if (!this.model.unsaved) {
        const newSearch: any = {urn: this.model.id};
        if (this.selection) {
          newSearch[this.selection.type] = this.selection.id;
        }

        const search = _.clone(this.$location.search());
        delete search.property;

        if (!_.isEqual(search, newSearch)) {
          this.$location.search(newSearch);
        }
      }
    }
  }

  private addClass() {
    this.searchClassModal.open(this.model, collectIds(this.classes))
      .then((result: ConceptCreation|Class) => {
        if (isConceptCreation(result)) {
          this.createClass(result);
        } else if (result instanceof Class) {
          this.assignClassToModel(result);
        }
      });
  }

  private createClass(conceptCreation: ConceptCreation) {
    this.classService.newClass(this.model, conceptCreation.label, conceptCreation.concept.id, this.languageService.modelLanguage)
      .then(klass => this.updateSelection(klass));
  }

  private assignClassToModel(klass: Class) {
    this.classService.assignClassToModel(klass.id, this.model.id)
      .then(() => {
        this.updateSelection(klass);
        this.updateClasses();
      });

    _.forEach(_.map(klass.properties, (property: Property) => this.predicateService.getPredicate(property.predicateId)),
      predicate => predicate.then(this.assignPredicateToModel));
  }

  private addPredicate(type: Type) {
    this.searchPredicateModal.open(this.model, type, collectIds(this.predicates))
      .then((result: ConceptCreation|Predicate) => {
        if (isConceptCreation(result)) {
          this.createPredicate(result);
        } else {
          this.assignPredicateToModel(result);
        }
      });
  }

  private createPredicate(conceptCreation: ConceptCreation) {
    this.predicateService.newPredicate(this.model, conceptCreation.label, conceptCreation.concept.id, conceptCreation.type, this.languageService.modelLanguage)
      .then(predicate => this.updateSelection(predicate));
  }

  private assignPredicateToModel(predicate: Predicate) {
    this.predicateService.assignPredicateToModel(predicate.id, this.model.id)
      .then(() => {
        this.updateSelection(predicate);
        this.updatePredicates();
      });
  }

  private askPermissionWhenEditing(callback: () => void) {
    const editingViews = _.filter(this.views, view => view.isEditing());

    if (editingViews.length > 0) {
      this.confirmationModal.openEditInProgress().then(() => {
        _.forEach(editingViews, view => view.cancelEditing());
        callback();
      });
    } else {
      callback();
    }
  }

  private updateSelectionByTypeAndId(selection: WithIdAndType) {
    if (selection) {
      return this.fetchEntityByTypeAndId(selection).then(entity => this.updateSelection(entity));
    } else {
      return this.updateSelection(null);
    }
  }

  private fetchEntityByTypeAndId(selection: WithIdAndType): IPromise<Class|Predicate> {
    if (!this.selection || !areEqual(this.selection, selection)) {
      return selection.type === 'class'
        ? this.classService.getClass(selection.id)
        : this.predicateService.getPredicate(selection.id);
    } else {
      return this.$q.when(this.selection);
    }
  }

  private updateSelection(selection: Class|Predicate) {
    return this.$q.when(this.selection = selection);
  }

  private updateModelById(modelId: Uri) {
    if (!this.model || this.model.id !== modelId) {
      return this.modelService.getModelByUrn(modelId).then(model => this.updateModel(model));
    } else {
      return this.$q.reject();
    }
  }

  private updateNewModel(newModel: {prefix: string, label: string, groupId: Uri}) {
    return this.modelService.newModel(newModel, this.languageService.modelLanguage).then(model => this.updateModel(model));
  }

  private updateModel(model: Model) {
    return this.$q.when(this.model = model);
  }

  private updateSelectables(): IPromise<any> {
    return this.$q.all([this.updateClasses(), this.updatePredicates()]);
  }

  private updateClasses(): IPromise<ClassListItem[]> {
    return this.classService.getClassesForModel(this.model.id).then(classes => this.classes = classes);
  }

  private updatePredicates(): IPromise<PredicateListItem[]> {
    return this.predicateService.getPredicatesForModel(this.model.id).then(predicates => this.predicates = predicates);
  }
}

function areEqual(lhs: WithIdAndType, rhs: WithIdAndType): boolean {
  if ((lhs && !rhs) || (rhs && !lhs)) {
    return false;
  }

  return lhs.type === rhs.type && lhs.id === rhs.id;
}

class RouteData {

  existingModelId: Uri;

  constructor(private params: any) {
    this.existingModelId = params.urn;
  }

  get newModel() {
    if (this.params.label && this.params.prefix && this.params.group) {
      return {label: this.params.label, prefix: this.params.prefix, groupId: this.params.group};
    }
  }

  get selected() {
    for (const type of ['attribute', 'class', 'association']) {
      const id: Uri = this.params[type];
      if (id) {
        return {type, id};
      }
    }
  }
}

class Tab {

  addLabel: string;
  glyphIconClass: any;
  active: boolean;

  constructor(public type: Type, public items: () => WithIdAndType[], public addNew: () => void) {
    this.addLabel = 'Add ' + type;
    this.glyphIconClass = glyphIconClassForType(type);
  }
}

interface View {
  isEditing(): boolean;
  cancelEditing(): void;
}
