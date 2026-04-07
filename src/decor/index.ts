export abstract class Decor<T = any> {
    protected readonly _brand = Symbol('decor')

    constructor(origin: T) { this._origin = origin; }

    private _origin: T;
    protected get origin() {
        return this._origin;
    }
    public abstract result: T;
}

export abstract class CustomDecor<T> extends Decor<T> {
    protected readonly _brand = Symbol('custom-decor')

    constructor(origin: T) {
        super(origin);
        this.result = origin;
    }
    public result: T;
}
