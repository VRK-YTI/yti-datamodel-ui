import { IPromise, IQService } from 'angular';
import {
  GraphData, EntityFactory, EntityConstructor,
  EntityArrayFactory, EntityArrayConstructor
} from 'app/types/entity';
import { normalizeAsArray } from 'yti-common-ui/utils/array';
import { GraphNode, GraphNodes } from 'app/entities/graphNode';

const jsonld: any = require('jsonld');

export class FrameService {
  constructor(private $q: IQService) {
    'ngInject';
  }

  private frameData(data: GraphData, frame: any): IPromise<GraphData> {
    
    // For some reason iow:vertexXY is returned as array of objects instead of array of strings
    const graphElements = data["@graph"].map((elem: any) => {
      if (!elem["iow:vertexXY"]) {
        return elem;
      }

      if (Array.isArray(elem["iow:vertexXY"])) {
        const vtx = { "@list": elem["iow:vertexXY"].map((x: any) => x["@list"][0])};
        elem = Object.assign({}, ...elem, { "iow:vertexXY": vtx });
      }
      return elem;
    })
    
    data["@graph"] = graphElements;

    return jsonld.promises.frame(data, frame)
      .then((framed: GraphData) => framed, (err: any) => {
        console.log('Error: ' + err.message);
        console.log('Cause: ' + err.details.cause);
        this.logDataForError(data, frame);
        throw err;
      });
  }

  private logDataForError(data: any, frame: any, framed?: any): void {

    console.log('==== Data ===');
    console.log(JSON.stringify(data, null, 2));
    console.log('==== Frame ===');
    console.log(JSON.stringify(frame, null, 2));

    if (framed) {
      console.log('==== Framed ===');
      console.log(JSON.stringify(framed, null, 2));
    }
  }

  frameAndMap<T extends GraphNode>(data: GraphData, optional: boolean, frame: {}, entityFactory: EntityFactory<T>): IPromise<T|null> {

    return this.frameData(data, frame)
      .then(framed => {
        try {
          if (framed['@graph'].length > 1) {
            throw new Error('Multiple graphs found: \n' + JSON.stringify(framed, null, 2));
          } else {

            if (framed['@graph'].length === 0) {
              if (optional) {
                return null;
              } else {
                throw new Error('Required object but after framing got none');
              }
            }

            const entity: EntityConstructor<T> = entityFactory(framed);

            return new entity(framed['@graph'][0], framed['@context'], frame);
          }
        } catch (error) {
          console.log(error);
          this.logDataForError(data, frame, framed);
          throw error;
        }
      });
  }

  frameAndMapArray<T extends GraphNode>(data: GraphData, frame: {}, entityFactory: EntityFactory<T>): IPromise<T[]> {

    return this.frameData(data, frame)
      .then(framed => {
        try {
          return normalizeAsArray(framed['@graph']).map(element => {
            const entity: EntityConstructor<T> = entityFactory(element);
            return new entity(element, framed['@context'], frame);
          });
        } catch (error) {
          console.log(error);
          this.logDataForError(data, frame, framed);
          throw error;
        }
      });
  }

  frameAndMapArrayEntity<T extends GraphNode, A extends GraphNodes<T>>(data: GraphData, frame: {}, entityArrayFactory: EntityArrayFactory<T, A>): IPromise<A> {

    return this.frameData(data, frame)
      .then(framed => {
        try {
          const entity: EntityArrayConstructor<T, A> = entityArrayFactory(framed);
          return new entity(framed['@graph'], framed['@context'], frame);
        } catch (error) {
          console.log(error);
          this.logDataForError(data, frame, framed);
          throw error;
        }
      });
  }
}
