import { Model } from "../../model";
import { AbstractConstructor } from "../../types";
import { View } from "../../view";

class DepRegistry {
    private _config: Map<AbstractConstructor<Model | View>, string[]> = new Map();

    public register(prototype: Model | View, key: string) {
        const constructor: any = prototype.constructor;
        const keys = this._config.get(constructor) ?? [];
        keys.push(key);
        this._config.set(constructor, keys);
    }
}

export const depRegistry = new DepRegistry();
