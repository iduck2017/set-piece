import type { Model } from "../model";
import { ModelDef } from "./model/define";

export type Event<T> = (event: T) => T | void;

export namespace Event {
    export type StateCheck<M extends ModelDef, T> = {
        target: Model<M>,
        prev: T,
        next: T,
        isAborted?: boolean
    }
    export type StateAlter<M extends ModelDef, T> = {
        target: Model<M>,
        next: T,
        prev: T,
    }
    export type PreCastrated<M extends Model> = {
        model: M,
        isAborted?: boolean
    }
    export type Castrated<M extends Model> = {
        model: M,
    }
}
