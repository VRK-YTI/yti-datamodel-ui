import { IHttpService, IPromise, IQService } from 'angular';
import { apiEndpointWithName } from './config';
import { Uri } from 'app/entities/uri';
import { Language } from 'app/types/language';
import { normalizeAsArray, flatten } from 'yti-common-ui/utils/array';
import * as frames from 'app/entities/frames';
import { FrameService } from './frameService';
import { GraphData } from 'app/types/entity';
import { ReferenceDataCode, ReferenceData, ReferenceDataServer } from 'app/entities/referenceData';
import { requireDefined } from 'yti-common-ui/utils/object';

export class ReferenceDataService {

  // indexed by reference data id
  private referenceDataCodesCache = new Map<string, IPromise<ReferenceDataCode[]>>();

  constructor(private $http: IHttpService, private $q: IQService, private frameService: FrameService) {
    'ngInject';
  }

  getReferenceDataServers(): IPromise<ReferenceDataServer[]> {
    return this.$http.get<GraphData>(apiEndpointWithName('codeServer'))
      .then(response => this.deserializeReferenceDataServers(response.data!));
  }

  getReferenceDatasForServer(server: ReferenceDataServer): IPromise<ReferenceData[]> {
    return this.$http.get<GraphData>(apiEndpointWithName('codeList'), { params: { uri: server.id.uri } })
      .then(response => this.deserializeReferenceDatas(response.data!));
  }

  getReferenceDatasForServers(servers: ReferenceDataServer[]): IPromise<ReferenceData[]> {
    return this.$q.all(servers.map(server => this.getReferenceDatasForServer(server)))
      .then(referenceDatas => flatten(referenceDatas));
  }

  getAllReferenceDatas(): IPromise<ReferenceData[]> {
    return this.getReferenceDataServers().then(servers => this.getReferenceDatasForServers(servers));
  }

  getReferenceDataCodes(referenceData: ReferenceData|ReferenceData[], force: boolean = false): IPromise<ReferenceDataCode[]> {

    const getSingle = (rd: ReferenceData) => {
      const cached = this.referenceDataCodesCache.get(rd.id.uri);

      if (cached && !force) {
        return cached;
      } else {
        const result = this.$http.get<GraphData>(apiEndpointWithName('codeValues'), {params: {uri: rd.id.uri, force}})
          .then(response => this.deserializeReferenceDataCodes(response.data!));

        this.referenceDataCodesCache.set(rd.id.uri, result);
        return result;
      }
    };

    const internalReferenceData = normalizeAsArray(referenceData).filter(rd => !rd.isExternal());

    return this.$q.all(internalReferenceData.map(rd => getSingle(rd))).then(flatten);
  }

  newReferenceData(uri: Uri, label: string, description: string, lang: Language): IPromise<ReferenceData> {
    return this.$http.get<GraphData>(apiEndpointWithName('codeListCreator'), {params: {uri: uri.uri, label, description, lang}})
      .then(response => this.deserializeReferenceData(response.data!));
  }

  private deserializeReferenceDataServers(data: GraphData): IPromise<ReferenceDataServer[]> {
    return this.frameService.frameAndMapArray(data, frames.referenceDataServerFrame(data), () => ReferenceDataServer);
  }

  private deserializeReferenceData(data: GraphData): IPromise<ReferenceData> {
    return this.frameService.frameAndMap(data, false, frames.referenceDataFrame(data), () => ReferenceData).then(requireDefined);
  }

  private deserializeReferenceDatas(data: GraphData): IPromise<ReferenceData[]> {
    return this.frameService.frameAndMapArray(data, frames.referenceDataFrame(data), () => ReferenceData);
  }

  private deserializeReferenceDataCodes(data: GraphData): IPromise<ReferenceDataCode[]> {
    return this.frameService.frameAndMapArray(data, frames.referenceDataCodeFrame(data), () => ReferenceDataCode);
  }
}
