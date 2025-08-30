import { Model } from "../model";
import { IConstructor } from ".";
import { Props } from "./model";

export type DecorUpdater<
    S extends Record<string, any> = Record<string, any>,
    M extends Model = Model,
> = (model: M, state: Readonly<Model.State<S>>) => Readonly<Model.State<S>>

export class DecorConsumer {
    public readonly model: Model;
    public readonly updater: DecorUpdater;
    constructor(
        model: Model,
        updater: DecorUpdater
    ) {
        this.model = model;
        this.updater = updater;
    }
}

export class DecorProducer<
    S extends Props.S = Props.S,
    M extends Model = Model
> {
    public readonly path?: string;
    public readonly type?: IConstructor<Model>;
    public readonly model: M;
    private readonly state?: S;
    constructor(
        model: M,
        path?: string,
        type?: IConstructor<Model>
    ) {
        this.model = model;
        this.path = path;
        this.type = type;
    }
}
