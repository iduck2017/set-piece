import { Model } from "./model"
import { Value } from "./types";

export type DecorUpdater<S = any, M extends Model = Model> = (target: M, state: S) => S
export type DecorProvider = { target: Model, updater: DecorUpdater }
export type DecorReceivers<
    S extends Record<string, Value>, 
    M extends Model = Model
> = { [K in keyof S]: DecorReceiver<Required<S>[K], M> }

export class DecorReceiver<S = any, M extends Model = Model> {
    readonly self: M;
    readonly pathAbsolute: string;
    readonly pathRelative: string;
    readonly key: string;

    constructor(self: M, path: string) {
        this.self = self;
        this.key = path.split('/').pop() ?? ''
        this.pathRelative = path;
        this.pathAbsolute = self.pathAbsolute ? `${self.pathAbsolute}/${path}` : path;
    }
}

