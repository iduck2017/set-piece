import { Model } from "../model";
import { AbstractConstructor } from "../types";

/**
 * Stores and runs lifecycle hook method keys.
 */
export class HookRegistry {
    private _keys: Map<AbstractConstructor<Model>, string[]> = new Map();

    /**
     * Collect inherited hook handlers from the model prototype chain.
     *
     * @param model - Model whose registered hooks should be read.
     * @returns Bound hook functions in ancestor-to-descendant lookup order.
     */
    public query(model: Model) {
        let ctor: any = model.constructor;
        const hooks: Function[] = [];
        while (ctor) {
            const keys = this._keys.get(ctor) ?? [];
            keys.forEach(key => {
                const handler = Reflect.get(model, key);
                if (handler instanceof Function) {
                    hooks.push(handler.bind(model));
                }
            });
            ctor = Object.getPrototypeOf(ctor);
        }
        return hooks;
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
        const ctor: any = prototype.constructor;
        const keys = this._keys.get(ctor) ?? [];
        keys.push(key);
        this._keys.set(ctor, keys);
    }
}
