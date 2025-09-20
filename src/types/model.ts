import { Primitive } from "utility-types";
import { Method, Value } from ".";
import { Model } from "../model"
import { Event } from "./event";

export namespace Props {
    export type S = Record<string, Value>
    export type E = Record<string, Event>
    export type C = Record<string, Model | Model[]>
    export type R = Record<string, Model | Model[]>
    export type P = Record<string, Model>
}

export type Loader<M extends Model> = Method<M['props'], []>
export type Memory<M extends Model  = Model> = {
    state: M['state'],
    refer: M['refer'],
    child: M['child'],
    route: M['route']
}

export namespace Format {
    export type S<T extends Props.S> = { [K in keyof T]: T[K] extends Primitive ? T[K] : Readonly<T[K]> }
    export type C<T extends Props.C> = { [K in keyof T]: T[K] extends any[] ? Readonly<T[K]> : T[K] }
    export type P<T extends Props.P> = Partial<T> & { root: Model, parent?: Model }
    export type E<T extends Props.E, M extends Model = Model> = T & { onChange: Event<Memory<M>> }
    export type R<T extends Props.R, F extends boolean = false> = F extends false ? 
        { [K in keyof T]: T[K] extends any[] ? Readonly<T[K]> : T[K] | undefined } : 
        { [K in keyof T]: T[K] extends any[] ? T[K] : T[K] | undefined }
}