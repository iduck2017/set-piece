import { Model } from "../model";

export type EventHandler<E = any, M extends Model = Model> = (model: M, event: E) => boolean | void
export type EventEmitter<E = any> = (event: E, isYield?: boolean) => boolean
export type EventConsumer = { model: Model, handler: EventHandler }
export type EventProducer<E = any, M extends Model = Model> = {
    path: string;
    model: M;
    event?: E;
}

