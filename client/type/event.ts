import { Model } from "../model";
import { ModelDef } from "./model/define";

export type Event<E> = (event: E) => E | void;

export namespace Event {
    export type StateEditor<M extends ModelDef, T> = {
        target: Model<M>,
        prev: T,
        next: T,
        isAborted?: boolean
    }
    
    export type StatePoster<M extends ModelDef, T> = {
        target: Model<M>,
        next: T,
        prev: T,
    }
}