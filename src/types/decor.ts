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

export class Decor<
    S extends E,
    E extends Model.S = {}
> {
    protected readonly _origin: S;
    public readonly origin: E;

    public get result(): Readonly<State<S>> { 
        return { ...this._origin }; 
    }

    constructor(model: Model<{}, S>) { 
        this._origin = { ...model.utils.state.origin };
        this.origin = this._origin;
    }
}