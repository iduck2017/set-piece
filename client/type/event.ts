import { Model } from "../model";
import { ModelDef } from "./model/define";

export type Event<E> = (event: E) => E | void;

export namespace Event {
    export type StateEdit<M extends ModelDef, T> = {
        target: Model<M>,
        prev: T,
        next: T,
        isBreak?: boolean
    }
    
    export type StatePost<M extends ModelDef, T> = {
        target: Model<M>,
        next: T,
        prev: T,
    }
}