import { Model } from "../model";
import { AbstractConstructor } from "../types";

class MemoRegistry {
    private _config: Map<AbstractConstructor<Model>, string[]> = new Map();

    public register(prototype: Model, key: string) {
        const type: any = prototype.constructor;
        const keys = this._config.get(type) ?? [];
        keys.push(key);
        this._config.set(type, keys);
    }

    public query(prototype: Model): string[] {
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

export const memoRegistry = new MemoRegistry();
