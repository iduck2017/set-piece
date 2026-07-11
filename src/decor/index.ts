import { Model } from '../model';

export abstract class Decor<T = any> {
    protected readonly _brand = Symbol('decor')

    public readonly target: Model;

    /**
     * Capture the original value and the model receiving the decor.
     *
     * A decor producer creates this object during property reads. Decor
     * consumers can mutate the decor before the producer reads `result`.
     *
     * @param origin - Raw producer value before decor consumers run.
     * @param target - Model that owns the decorated producer property.
     */
    constructor(origin: T, target: Model) {
        this.target = target;
        this._origin = origin;
    }

    protected _origin: T;
    public abstract get result(): T
}
