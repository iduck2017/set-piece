import { Model } from "../model";

export type EventHandler<E = any, M extends Model = Model> = (model: M, event: E) => void
export type EventConsumer = { model: Model, handler: EventHandler }
export type EventProducer<E = any, M extends Model = Model> = {
    path: string;
    model: M;
    event?: E;
}

