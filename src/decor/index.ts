import { Model } from '../model';

export abstract class Decor<T = any> {
    protected readonly _brand = Symbol('decor')
    
    public readonly target: Model;

    constructor(origin: T, target: Model) {
        this.target = target;
        this._origin = origin;
        this._result = origin;
    }

    private readonly _origin: T;
    protected get origin() { return this._origin }

    protected _result: T;
    public get result() {  return this._result }
}
