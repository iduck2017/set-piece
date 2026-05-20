import { Model } from '..';

export abstract class Decor<T = any> {
    protected readonly _brand = Symbol('decor')
    
    public readonly target: Model;

    constructor(origin: T, target: Model) {
        this.target = target;
        this._origin = origin;
    }

    protected readonly _origin: T;
    protected get origin() { return this._origin }

    public abstract get result(): T
}
