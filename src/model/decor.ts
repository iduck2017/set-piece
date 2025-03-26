import { Model } from "./model"
import { Value } from "./types";

export type DecorUpdater<S = any, M extends Model = Model> = (target: M, state: S) => S
export type DecorProvider = { target: Model, updater: DecorUpdater }
export type DecorReceivers<
    S extends Record<string, Value>, 
    M extends Model = Model
> = { [K in keyof S]: DecorReceiver<Required<S>[K], M> }

export class DecorReceiver<S = any, M extends Model = Model> {
    readonly target: M;
    readonly pathRelative: string;
    readonly pathAbstract: string;

    constructor(target: M, path: string) {
        this.target = target;
        this.pathRelative = path;
        this.pathAbstract = `${target.pathAbstract}/${path}`;
    }
}

