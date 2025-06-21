import { Model } from "../model";
import { State } from "../types";

export type DecorUpdater<
    S extends Record<string, any> = Record<string, any>,
    M extends Model = Model,
> = (model: M, state: Readonly<State<S>>) => Readonly<State<S>>

export type DecorConsumer = { model: Model, updater: DecorUpdater }

export class DecorProducer<
    S extends Record<string, any> = Record<string, any>,
    M extends Model = Model,
> {
    public readonly path: string;
    public readonly model: M;
    constructor(model: M, path?: string) {
        this.model = model;
        this.path = path ? `${path}/decor` : 'decor';
    }
}

