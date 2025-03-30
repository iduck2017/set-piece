import { Model } from "./model";
import { Value } from "../types";
export type DecorUpdater<S = any, M extends Model = Model> = (target: M, state: S) => S;
export type DecorProvider = {
    target: Model;
    updater: DecorUpdater;
};
export type DecorReceivers<S extends Record<string, Value>, M extends Model = Model> = {
    [K in keyof S]: DecorReceiver<Required<S>[K], M>;
};
export declare class DecorReceiver<S = any, M extends Model = Model> {
    readonly target: M;
    readonly path: string;
    constructor(target: M, path: string);
}
