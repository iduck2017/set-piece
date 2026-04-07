import { Model } from "../model";
import { AbstractConstructor } from "../types";

export class HookRegistry {
    private _context: Map<AbstractConstructor<Model>, string[]> = new Map();

    public query(model: Model) {
        let constructor: any = model.constructor;
        const result: Function[] = [];
        while (constructor) {
            const keys = this._context.get(constructor) ?? [];
            keys.forEach(key => {
                const method = Reflect.get(model, key);
                if (method instanceof Function) {
                    result.push(method.bind(model));
                }
            });
            constructor = Object.getPrototypeOf(constructor);
        }
        return result;
    }

    public run(model: Model) {
        const hooks = this.query(model);
        hooks.forEach(hook => hook());
    }

    public register(prototype: Model, key: string) {
        const constructor: any = prototype.constructor;
        const keys = this._context.get(constructor) ?? [];
        keys.push(key);
        this._context.set(constructor, keys);
    }
}
