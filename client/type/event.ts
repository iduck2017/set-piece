import { Model } from "@/model";
import { ChildOf, StateOf } from "./model";
import { Mutable } from "utility-types";

export type Handler<D> = (target: Model, data: D) => void; 
export type Emitter<D> = (data: D) => void;

export type Event<E = any> = {
    target: Model;
    key: string;
    uuid: string;
    alias: Array<Event<E>>
}
export type React<E = any> = {
    target: Model;
    uuid: string;
    handler: Handler<E>;
}

export type OnModelAlter<M extends Model> = {
    target: M;
    prev: Readonly<StateOf<M>>;
    next: Readonly<StateOf<M>>;
    final?: Readonly<StateOf<M>>;
}
export type OnModelSpawn<M extends Model> = {
    target: M;
    next: Readonly<ChildOf<M>>;
}
export type OnModelCheck<M extends Model> = {
    target: M;
    prev: Readonly<StateOf<M>>;
    next: Mutable<StateOf<M>>;
}
