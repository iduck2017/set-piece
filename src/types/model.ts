import { Primitive } from "utility-types";
import { IType, Method, Value } from ".";
import { Model } from "../model"
import { Event } from "./event";

export type StateChangeEvent<M extends Model> = Event<{ prev: M['state'], next: M['state'] }>;
export type ChildChangeEvent<M extends Model> = Event<{ prev: M['child'], next: M['child'] }>;
export type ReferChangeEvent<M extends Model> = Event<{ prev: M['refer'], next: M['refer'] }>;
export type RouteChangeEvent<M extends Model> = Event<{ prev: M['route'], next: M['route'] }>;

export namespace Props {
    export type E = Record<string, Event | void>
    export type S = Record<string, Value>
    export type C = Record<string, Model | Model[]>
    export type R = Record<string, Model | Model[]>
    export type P = Record<string, Model>
}

export namespace Format {
    export type State<S extends Props.S = {}> = { [K in keyof S]: S[K] extends Primitive ? S[K] : Readonly<S[K]> }
    export type Child<C extends Props.C = {}> = { [K in keyof C]: C[K] extends any[] ? Readonly<C[K]> : C[K] }
    export type Refer<R extends Props.R = {}, F = false> = F extends false ? 
        { [K in keyof R]: R[K] extends any[] ? Readonly<R[K]> : R[K] | undefined } :
        { [K in keyof R]: R[K] extends any[] ? R[K] : R[K] | undefined }

    export type Route<P extends Props.P = {}> = { [K in keyof P]?: P[K] } & { root: Model, parent?: Model }
    export type Event<E extends Props.E = {}, M extends Model = Model> = E & {
        onStateChange: StateChangeEvent<M>
        onChildChange: ChildChangeEvent<M>;
        onReferChange: ReferChangeEvent<M>;
        onRouteChange: RouteChangeEvent<M>;
    }
}

export type Loader<M extends Model> = Method<M['props'], []>