import { Model } from "../model";
import { IType } from ".";
import { Props } from "./model";

export type DecorUpdater<
    S extends Props.S = Props.S,
    M extends Model = Model
> = (that: M, decor: Decor<S>) => void;

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

export class Decor<S extends Props.S = Props.S> {
    public readonly origin: Readonly<S>;
    public readonly draft: S;

    constructor(model: Model, origin: S) { 
        this.origin = origin;
        this.draft = new Proxy(origin, {});
    }
}