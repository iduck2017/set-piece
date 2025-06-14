import { Model } from "../model";
import { DeepReadonly } from "utility-types";

export type DecorUpdater<S = any, M extends Model = Model> = (model: M, state: DeepReadonly<S>) => DeepReadonly<S>

export type DecorConsumer = { model: Model, updater: DecorUpdater }

export class DecorProducer<S = any, M extends Model = Model> {
    public readonly path: string;

    public readonly model: M;

    constructor(model: M, path?: string) {
        this.model = model;
        this.path = path ? `${path}/decor` : 'decor';
    }
}

