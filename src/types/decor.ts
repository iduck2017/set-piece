import { Model } from "../model"
import { Value } from ".";

export type DecorUpdater<S = any, M extends Model = Model> = (target: M, state: S) => S
export type DecorConsumer = { target: Model, updater: DecorUpdater }
export type DecorProducers<
    S extends Record<string, Value>, 
    M extends Model = Model
> = { [K in keyof S]: DecorProducer<Required<S>[K], M> }

export class DecorProducer<S = any, M extends Model = Model> {
    readonly target: M;
    readonly path: string;

    constructor(target: M, path: string) {
        this.target = target;
        this.path = path;
    }
}

