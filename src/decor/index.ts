import { Model } from '../model';

export abstract class Decor<T = any> {
    protected readonly _brand = Symbol('decor')

    constructor(origin: T, target: Model) {
        this._origin = origin;
        this.target = target;
    }

    private _origin: T;
    protected get origin() {
        return this._origin;
    }
    public abstract result: T;
    public readonly target: Model;
}

export abstract class CustomDecor<T> extends Decor<T> {
    protected readonly _brand = Symbol('custom-decor')

    constructor(origin: T, target: Model) {
        super(origin, target);
        this.result = origin;
    }
    public result: T;
}
