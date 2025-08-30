import { Value } from ".";
import { Model } from "../model"
import { Event } from "./event";

export type StateChangeEvent<M extends Model> = Event<{ prev: M['state'], next: M['state'] }>;
export type ChildChangeEvent<M extends Model> = Event<{ prev: M['child'], next: M['child'] }>;
export type ReferChangeEvent<M extends Model> = Event<{ prev: M['refer'], next: M['refer'] }>;
export type RouteChangeEvent<M extends Model> = Event<{ prev: M['route'], next: M['route'] }>;

export namespace Props {
    export type E = Record<string, Event>
    export type S = Record<string, Value>
    export type C = Record<string, Model | Model[]>
    export type R = Record<string, Model | Model[]>
}
export type Props = {
    event: Record<string, Event>
    state: Record<string, Value>
    child: Record<string, Model | Model[]>
    refer: Record<string, Model | Model[]>
}