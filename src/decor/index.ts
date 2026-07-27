import { Model } from '../model';

/**
 * Base value transformer used by decor producers and consumers.
 */
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

/**
 * Base decor for numeric accumulation.
 */
export abstract class NumDecor extends Decor<number> {
    private _result: number;
    public get result() { return this._result; }

    /**
     * Create a numeric decor whose result starts from the producer value.
     *
     * @param origin - Raw number before decor consumers run.
     * @param target - Model that owns the decorated producer property.
     */
    constructor(origin: number, target: Model) {
        super(origin, target);
        this._result = origin;
    }

    /**
     * Add a numeric modifier to the decorated result.
     *
     * @param value - Amount added by a decor consumer.
     * @returns Nothing.
     */
    public add(value: number) {
        this._result += value;
    }

    /**
     * Replace the decorated numeric result.
     *
     * @param value - Number supplied by a decor consumer.
     * @returns Nothing.
     */
    public set(value: number) {
        this._result = value;
    }
}

/**
 * Base decor for boolean overrides.
 */
export abstract class BoolDecor extends Decor<boolean> {
    private _result: boolean;
    public get result() { return this._result; }

    /**
     * Create a boolean decor whose result starts from the producer value.
     *
     * @param origin - Raw boolean before decor consumers run.
     * @param target - Model that owns the decorated producer property.
     */
    constructor(origin: boolean, target: Model) {
        super(origin, target);
        this._result = origin;
    }

    /**
     * Replace the decorated boolean result.
     *
     * @param value - Boolean value supplied by a decor consumer.
     * @returns Nothing.
     */
    public set(value: boolean) {
        this._result = value;
    }
}
