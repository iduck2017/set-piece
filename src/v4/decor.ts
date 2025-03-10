import { Model } from "./model"

export type DecorReceivers<S extends Record<string, any>, M extends Model = Model> = { [K in keyof S]: DecorReceiver<Required<S>[K], M> }
export type DecorUpdater<S = any, M extends Model = Model> = (target: M, state: S) => S

export class DecorReceiver<S = any, M extends Model = Model> {
    readonly target: M;
    readonly path: string[];
    readonly key: string;

    constructor(target: M, key: string, path?: string[]) {
        this.target = target;
        this.key = key;
        this.path = path ?? [];
    }
}

