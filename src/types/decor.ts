import { Model } from "../model";
import { IConstructor } from ".";
import { State } from "./model";

export type DecorUpdater<
    S extends Record<string, any> = Record<string, any>,
    M extends Model = Model,
> = (model: M, state: Readonly<State<S>>) => Readonly<State<S>>

export type DecorConsumer = { model: Model, updater: DecorUpdater }
export type DecorProducer<
    S extends Record<string, any> = Record<string, any>,
    M extends Model = Model,
> = {
    path?: string;
    type?: IConstructor<Model>;
    model: M;
    state?: S
}