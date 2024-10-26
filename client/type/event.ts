import { Model } from "../model";

export type Event<E> = (event: E) => E | void;

export namespace Event {
    export type StateEdit<M extends Model, T> = {
        target: M,
        prev: T,
        next: T,
        isBreak?: boolean
    }
    
    export type StatePost<M extends Model, T> = {
        target: M,
        next: T,
        prev: T,
    }
}