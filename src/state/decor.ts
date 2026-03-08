import { Model } from "../model";
import { decorListenerRegistry } from "./listener";

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

export function getDecorHandlers(model: Model, decor: Decor) {
    let ancestor: Model | undefined = model;
    const result: Array<(target: Model, decor: Decor) => void> = [];
    while (ancestor) {
        const handlerRegistry = decorListenerRegistry.get(ancestor);
        const handlerKeysMap = handlerRegistry?.get(decor.constructor);
        handlerKeysMap?.forEach((keys, model) => {
            keys.forEach(key => {
                const method = Reflect.get(model, key);
                if (method instanceof Function) {
                    result.push(method.bind(model));
                }
            });
        })
        ancestor = ancestor.parent;
    }
    // console.log('Get handlers', result)
    return result;
}

export function emitDecor(target: Model, decor: Decor) {
    const handlers = getDecorHandlers(target, decor);
    handlers.forEach(handler => {
        handler(target, decor);
    });
}
