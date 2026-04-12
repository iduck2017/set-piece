import { Model } from "../model";
import { AbstractConstructor } from "../types";

export type WeakRefUnloader = (refSource: Model | undefined, key: string, refTarget: Model | undefined) => void;
export type WeakRefUnloaderMap = Map<string, WeakRefUnloader>;
class WeakRefRegistry {
    private _config: Map<AbstractConstructor<Model>, WeakRefUnloaderMap> = new Map();

    public register(
        prototype: Model,
        key: string,
        unbinder: WeakRefUnloader,
    ) {
        const type: any = prototype.constructor;
        const subConfig: WeakRefUnloaderMap = this._config.get(type) ?? new Map();
        subConfig.set(key, unbinder);
        this._config.set(type, subConfig);
    }

    public query(model: Model): WeakRefUnloaderMap {
        const result: WeakRefUnloaderMap = new Map();
        let constructor: any = model.constructor;
        while (constructor) {
            const subConfig: WeakRefUnloaderMap = this._config.get(constructor) ?? new Map();
            subConfig.forEach((unbinder, key) => {
                if (result.has(key)) return;
                result.set(key, unbinder);
            });
            constructor = Object.getPrototypeOf(constructor);
        };
        return result;
    }
}
export const weakRefRegistry = new WeakRefRegistry();
