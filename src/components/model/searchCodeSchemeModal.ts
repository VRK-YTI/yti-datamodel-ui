import IModalService = angular.ui.bootstrap.IModalService;
import IModalServiceInstance = angular.ui.bootstrap.IModalServiceInstance;
import IPromise = angular.IPromise;
import IScope = angular.IScope;
import { ModelService } from '../../services/modelService';
import { CodeScheme, Model, CodeGroup, CodeServer, CodeValue } from '../../services/entities';
import { comparingBoolean, comparingString, comparingLocalizable } from '../../services/comparators';
import { Localizer, LanguageService } from '../../services/languageService';
import { AddNew } from '../common/searchResults';
import gettextCatalog = angular.gettext.gettextCatalog;
import { EditableForm } from '../form/editableEntityController';
import { Uri } from '../../services/uri';

const noExclude = (codeScheme: CodeScheme) => <string> null;

export class SearchCodeSchemeModal {
  /* @ngInject */
  constructor(private $uibModal: IModalService) {
  }

  open(model: Model, exclude: (codeScheme: CodeScheme) => string = noExclude): IPromise<CodeScheme> {
    return this.$uibModal.open({
      template: require('./searchCodeSchemeModal.html'),
      size: 'large',
      controller: SearchCodeSchemeModalController,
      controllerAs: 'ctrl',
      backdrop: true,
      resolve: {
        model: () => model,
        exclude: () => exclude
      }
    }).result;
  }
}

type CodeSchemeSelection = {
  scheme: CodeScheme;
  values: CodeValue[];
}

export interface SearchCodeSchemeScope extends IScope {
  form: EditableForm;
}

export class SearchCodeSchemeModalController {

  searchResults: (CodeScheme|AddNewCodeScheme)[];
  codeServers: CodeServer[];
  codeSchemes: CodeScheme[];
  codeGroups: CodeGroup[];
  showServer: CodeServer;
  showGroup: CodeGroup;
  searchText: string = '';
  loadingResults: boolean;
  selectedItem: CodeScheme|AddNewCodeScheme;
  selection: CodeSchemeSelection|AddNewSchemeFormData;
  cannotConfirm: string;
  submitError: string;

  localizer: Localizer;

  /* @ngInject */
  constructor(private $scope: SearchCodeSchemeScope,
              private $uibModalInstance: IModalServiceInstance,
              public model: Model,
              private modelService: ModelService,
              languageService: LanguageService,
              private gettextCatalog: gettextCatalog,
              public exclude: (codeScheme: CodeScheme) => string) {

    this.localizer = languageService.createLocalizer(model);
    this.loadingResults = true;

    const serversPromise = modelService.getCodeServers().then(servers => this.codeServers = servers);

    $scope.$watch(() => this.showServer, server => {

      this.loadingResults = true;

      serversPromise.then(servers => {
        modelService.getCodeSchemesForServers(server ? [server] : servers)
        .then(result => {
          this.codeSchemes = result;
          this.codeGroups = _.chain(this.codeSchemes)
            .map(codeScheme => codeScheme.groups)
            .flatten()
            .uniq(codeGroup => codeGroup.id.uri)
            .sort(comparingLocalizable<CodeGroup>(this.localizer.language, codeGroup => codeGroup.title))
            .value();

          if (this.showGroup && !_.find(this.codeGroups, group => group.id.equals(this.showGroup.id))) {
            this.showGroup = null;
          }

          this.search();

          this.loadingResults = false;
        });
      });
    });

    $scope.$watch(() => this.searchText, () => this.search());
    $scope.$watch(() => this.showExcluded, () => this.search());
    $scope.$watch(() => this.showGroup, () => this.search());
  }

  get showExcluded() {
    return !!this.searchText;
  }

  search() {
    if (this.codeSchemes) {

      const result: (CodeScheme|AddNewCodeScheme)[] = [
        new AddNewCodeScheme(`${this.gettextCatalog.getString('Create new code scheme')} '${this.searchText}'`, this.canAddNew.bind(this))
      ];

      const schemeSearchResults = this.codeSchemes.filter(scheme =>
        this.textFilter(scheme) &&
        this.excludedFilter(scheme) &&
        this.groupFilter(scheme)
      );

      schemeSearchResults.sort(
        comparingBoolean((scheme: any) => !!this.exclude(scheme))
          .andThen(comparingString((scheme: any) => scheme.title)));

      this.searchResults = result.concat(schemeSearchResults);
    }
  }

  selectItem(item: CodeScheme|AddNewCodeScheme) {
    this.selectedItem = item;
    this.submitError = null;
    this.$scope.form.editing = false;
    this.$scope.form.$setPristine();

    if (item instanceof AddNewCodeScheme) {
      this.$scope.form.editing = true;
      this.selection = new AddNewSchemeFormData();

    } else if (item instanceof CodeScheme) {

      this.cannotConfirm = this.exclude(item);

      if (!this.exclude(item)) {
        this.modelService.getCodeValues(item)
          .then(values => this.selection = { scheme: item, values });
      }
    } else {
      throw new Error('Unsupported item: ' + item);
    }
  }

  confirm() {
    const selection = this.selection;

    if (selection instanceof AddNewSchemeFormData) {
      this.modelService.newCodeScheme(selection.uri, selection.label, selection.description, this.localizer.language)
        .then(codeScheme => this.$uibModalInstance.close(codeScheme), err => this.submitError = err.data.errorMessage);
    } else {
      this.$uibModalInstance.close((<CodeSchemeSelection> selection).scheme);
    }
  }

  loadingSelection(item: CodeScheme|AddNewSchemeFormData) {
    const selection = this.selection;
    if (item instanceof CodeScheme) {
      return item === this.selectedItem && (!selection || (!this.isSelectionFormData() && !item.id.equals((<CodeSchemeSelection> selection).scheme.id)));
    } else {
      return false;
    }
  }

  isSelectionFormData(): boolean {
    return this.selection instanceof AddNewSchemeFormData;
  }

  canAddNew() {
    return !!this.searchText;
  }

  private textFilter(codeScheme: CodeScheme): boolean {
    return !this.searchText || this.localizer.translate(codeScheme.title).toLowerCase().includes(this.searchText.toLowerCase());
  }

  private excludedFilter(codeScheme: CodeScheme): boolean {
    return this.showExcluded || !this.exclude(codeScheme);
  }

  private groupFilter(codeScheme: CodeScheme): boolean {
    return !this.showGroup || !!_.find(codeScheme.groups, codeGroup => codeGroup.id.equals(this.showGroup.id));
  }

  close() {
    this.$uibModalInstance.dismiss();
  }
}

class AddNewSchemeFormData {
  uri: Uri;
  label: string;
  description: string;
}

class AddNewCodeScheme extends AddNew {
  constructor(public label: string, public show: () => boolean) {
    super(label, show);
  }
}