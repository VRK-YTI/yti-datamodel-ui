import { IScope } from 'angular';
import { ReferenceDataService } from 'app/services/referenceDataService';
import { ViewReferenceDataModal } from './viewReferenceDataModal';
import { ReferenceData, ReferenceDataCode } from 'app/entities/referenceData';
import { LanguageContext } from 'app/types/language';
import { LegacyComponent } from 'app/utils/angular';
import { UserService } from 'app/services/userService';

@LegacyComponent({
  bindings: {
    referenceData: '=',
    context: '=',
    title: '@',
    showCodes: '='
  },
  template: require('./referenceDataView.html')
})
export class ReferenceDataViewComponent {

  referenceData: ReferenceData;
  context: LanguageContext;
  title: string;
  showCodes: boolean;
  codes: ReferenceDataCode[] | null;
  isLoggedIn: boolean;

  constructor(private $scope: IScope,
              private referenceDataService: ReferenceDataService,
              private viewReferenceDataModal: ViewReferenceDataModal,
              private userService: UserService) {
    'ngInject';

    this.isLoggedIn = userService.isLoggedIn();
  }

  $onInit() {
    this.$scope.$watch(() => this.referenceData, referenceData => {
      if (referenceData && !referenceData.isExternal()) {
        this.referenceDataService.getReferenceDataCodes(referenceData)
          .then(values => this.codes = values);
      } else {
        this.codes = [];
      }
    });
  }

  update() {
    if (this.referenceData && !this.referenceData.isExternal()) {
      this.codes = null;
      this.referenceDataService.getReferenceDataCodes(this.referenceData, true)
        .then(values => this.codes = values);
    }
  }

  browse() {
    if (this.referenceData.isExternal()) {
      window.open(this.referenceData.id.uri, '_blank');
    } else {
      this.viewReferenceDataModal.open(this.referenceData, this.context);
    }
  }
}
