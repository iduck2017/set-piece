import { Model } from "../model";
import { modifierContext, getDecorHandlers } from "./modifier";

export abstract class Decor<T = any> {
    constructor(origin: T) {
        this._origin = origin;
    }
    private _origin: T;
    protected get origin() {
        return this._origin;
    }
    public abstract result: T;
}

export abstract class CustomDecor<T> extends Decor<T> {
    constructor(origin: T) {
        super(origin);
        this.result = origin;
    }
    public result: T;
}


export function emitDecor(target: Model, decor: Decor) {
    const handlers = getDecorHandlers(target, decor);
    handlers.forEach(handler => {
        handler(target, decor);
    });
}

export type DecorHandler<T extends Model, D extends Decor> = (target: T, decor: D) => void;
