import { Model } from '../model';

export abstract class Decor<T = any> {
    protected readonly _brand = Symbol('decor')

    public readonly target: Model;

    constructor(origin: T, target: Model) {
        this.target = target;
        this._origin = origin;
    }

    protected _origin: T;
    public abstract get result(): T
}

