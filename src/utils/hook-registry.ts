import { Model } from "../model";
import { AbstractConstructor } from "../types";

export class HookRegistry {
    private _context: Map<AbstractConstructor<Model>, string[]> = new Map();

    /**
     * Collect inherited hook handlers from the model prototype chain.
     *
     * @param model - Model whose registered hooks should be read.
     * @returns Bound hook functions in ancestor-to-descendant lookup order.
     */
    public query(model: Model) {
        let constructor: any = model.constructor;
        const result: Function[] = [];
        while (constructor) {
            const keys = this._context.get(constructor) ?? [];
            keys.forEach(key => {
                const handler = Reflect.get(model, key);
                if (handler instanceof Function) {
                    result.push(handler.bind(model));
                }
            });
            constructor = Object.getPrototypeOf(constructor);
        }
        return result;
    }

    /**
     * Run every hook registered for the model and its ancestors.
     *
     * @param model - Model whose hooks should be executed.
     * @returns Nothing.
     */
    public run(model: Model) {
        const hooks = this.query(model);
        hooks.forEach(hook => hook());
    }

    /**
     * Store a hook method key on the declaring constructor.
     *
     * @param prototype - Prototype that owns the hook method.
     * @param key - Hook method key.
     * @returns Nothing.
     */
    public register(prototype: Model, key: string) {
        const constructor: any = prototype.constructor;
        const keys = this._context.get(constructor) ?? [];
        keys.push(key);
        this._context.set(constructor, keys);
    }
}
