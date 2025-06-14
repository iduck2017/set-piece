import { Model } from "../model";

export type EventHandler<E = any, M extends Model = Model> = (model: M, event: E) => void

export type EventConsumer = { model: Model, handler: EventHandler }

export class EventProducer<E = any, M extends Model = Model> {
   
    public readonly path: string;
    
    public readonly model: M;
    
    public constructor(model: M, path: string) {
        this.path = path;
        this.model = model;
    }
}
