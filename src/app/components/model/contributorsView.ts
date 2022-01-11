import { IScope } from 'angular';
import { LanguageService } from 'app/services/languageService';
import { ColumnDescriptor, TableDescriptor } from 'app/components/form/editableTable';
import { collectProperties } from 'yti-common-ui/utils/array';
import { EditableForm } from 'app/components/form/editableEntityController';
import { LanguageContext } from 'app/types/language';
import { Organization } from 'app/entities/organization';
import { SearchOrganizationModal } from './searchOrganizationModal';
import { LegacyComponent, modalCancelHandler } from 'app/utils/angular';

interface WithContributors {
  contributors: Organization[];
  addContributor(organization: Organization): void;
  removeContributor(organization: Organization): void;
}

@LegacyComponent({
  bindings: {
    value: '=',
    context: '=',
    required: '='
  },
  require: {
    form: '?^form'
  },    template: `
      <h4>
        <span translate>Contributors</span>
        <button id="add_contributor_button" type="button" class="btn btn-link btn-xs pull-right" ng-click="$ctrl.addContributor()" ng-show="$ctrl.isEditing()">
          <span translate>Add contributor</span>
        </button>
        <span ng-show="$ctrl.required && $ctrl.isEditing()" class="fas fa-asterisk" uib-tooltip="{{'Required' | translate}}"></span>
      </h4>
      <editable-table id="'contributors'" descriptor="$ctrl.descriptor" expanded="$ctrl.expanded"></editable-table>
  `
})
export class ContributorsViewComponent {

  value: WithContributors;
  context: LanguageContext;

  descriptor: ContributorsTableDescriptor;
  expanded: boolean;

  form: EditableForm;

  constructor(private $scope: IScope,
              private languageService: LanguageService,
              private searchOrganizationModal: SearchOrganizationModal) {
    'ngInject';
  }

  $onInit() {
    this.$scope.$watch(() => this.value, value => {
      this.descriptor = new ContributorsTableDescriptor(value, this.context, this.languageService);
    });
  }

  isEditing() {
    return this.form && this.form.editing;
  }

  addContributor() {

    const organizationIds = this.value.contributors.reduce((result: Set<string>, org: Organization) => {
      if (org.parentOrg) {
        result.add(org.parentOrg.id.uri)
      }
      result.add(org.id.uri)
      return result;
    }, new Set<string>());

    // Do not allow to add both child and parent organization as a contributor
    const exclude = (organization: Organization) => {
      if (organizationIds.has(organization.id.toString())) {
        return 'Already added';
      } else if (organization.parentOrg) {
        if (organizationIds.has(organization.parentOrg.id.toString())) {
          return 'Already added';
        }
      }
      return null;
    };

    this.searchOrganizationModal.open(exclude)
      .then((organization: Organization) => {
        this.value.addContributor(organization);
        this.expanded = true;
      }, modalCancelHandler);
  }
}

class ContributorsTableDescriptor extends TableDescriptor<Organization> {

  constructor(private value: WithContributors, private context: LanguageContext, private languageService: LanguageService) {
    super();
  }

  columnDescriptors(): ColumnDescriptor<Organization>[] {
    return [
      { headerName: 'Name', nameExtractor: (c, isEditing) => {
          // show main organization's name in view mode
          let label = c.parentOrg && !isEditing ? c.parentOrg.label : c.label;

          // in editing mode show both child and parent organization
          const parentOrgName = c.parentOrg && isEditing ? ` (${this.languageService.translate(c.parentOrg.label, this.context)})` : '';

          return this.languageService.translate(label, this.context) + parentOrgName
        }
      }
    ];
  }

  values(): Organization[] {
    return this.value && this.value.contributors;
  }

  canEdit(_organization: Organization): boolean {
    return false;
  }

  canRemove(organization: Organization): boolean {
    return this.value.contributors.length > 0;
  }

  remove(organization: Organization): any {
    this.value.removeContributor(organization);
  }

  hasOrder(): boolean {
    return true;
  }
}
