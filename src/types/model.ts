import { Primitive } from "utility-types";
import { IType, Method, Type, Value } from ".";
import { Model } from "../model"
import { Event } from "./event";
import { Decor } from "./decor";

export namespace Props {
    export type S = Record<string, Value>
    export type E = Record<string, Event>
    export type C = Record<string, Model | Model[]>
    export type R = Record<string, Model | Model[]>
    export type P = Record<string, Model>
}

export type Loader<M extends Model> = Method<M['props'], []>


export type Route<T extends Props.P> = Partial<T> & { root: Model, parent?: Model }
export type State<T extends Props.S> = { [K in keyof T]: T[K] extends Primitive ? T[K] : Readonly<T[K]> }
export type Child<T extends Props.C> = { [K in keyof T]: T[K] extends any[] ? Readonly<T[K]> : T[K] }
export type Refer<T extends Props.R, F> = F extends false ?
    { [K in keyof T]: T[K] extends any[] ? Readonly<T[K]> : T[K] | undefined } :
    { [K in keyof T]: T[K] extends any[] ? T[K] : T[K] | undefined }


export type Frame<M extends Model  = Model> = {
    state: M['state'],
    refer: M['refer'],
    child: M['child'],
    route: M['route']
}