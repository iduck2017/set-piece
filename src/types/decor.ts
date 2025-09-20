import { Model } from "../model";
import { IType } from ".";
import { Props, State } from "./model";

export type Updater<M extends Model = Model> = (that: M, decor: M['decor']) => void;

export class Modifier {
    public readonly model: Model;
    public readonly updater: Updater;
    constructor(
        model: Model,
        updater: Updater
    ) {
        this.model = model;
        this.updater = updater;
    }
}

export class Computer<
    S extends Props.S = Props.S,
    M extends Model = Model
> {
    public readonly path?: string;
    public readonly type?: IType<Model>;
    public readonly model: M;
    private readonly state?: S;
    constructor(
        model: M,
        path?: string,
        type?: IType<Model>
    ) {
        this.model = model;
        this.path = path;
        this.type = type;
    }
}

export class Decor<S extends Props.S = {}> {
    protected detail: State<S>;
    
    public get result(): State<S> { return { ...this.detail }; }

    constructor(model: Model<{}, S>) { 
        this.detail = { ...model.utils.state.origin };
    }
}