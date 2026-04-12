import { Model } from "../model";
import { AbstractConstructor } from "../types";

class EffectRegistry {
    private _config: Map<AbstractConstructor<Model>, string[]> = new Map();

    public register(prototype: Model, key: string) {
        const constrcutor: any = prototype.constructor;
        const keys = this._config.get(constrcutor) ?? [];
        keys.push(key);
        this._config.set(constrcutor, keys);
    }

    public query(prototype: Model) {
        let constructor: any = prototype.constructor;
        const result: string[] = [];
        while (constructor) {
            const keys = this._config.get(constructor) ?? [];
            keys.forEach(key => {
                if (result.includes(key)) return;
                result.push(key);
            })
            constructor = Object.getPrototypeOf(constructor);
        }
        return result;
    }
}

export const effectRegistry = new EffectRegistry();
