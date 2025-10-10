import { Class, DeepReadonly } from "utility-types";
import { Primitive } from "utility-types";
import { Model } from "../model";
import { State } from "../utils/state";
import { IClass } from ".";

export type Updater<M extends Model = any> = (that: M, decor: M['decor']) => void

export type Modifier = { model: Model, updater: Updater }
export type Computer<
    S extends Model.S = Model.S,
    M extends Model = Model
> = {
    model: M;
    path?: string;
    type?: IClass<Model>;
    _never?: S;
}

export class Decor<S extends Model.S> {
    protected readonly _detail: S;
    public get result(): Readonly<State<S>> { 
        return { ...this._detail }; 
    }

    constructor(model: Model<{}, S>) { 
        this._detail = { ...model.utils.state.origin };
    }
}