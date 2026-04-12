import { Model } from "../model";
import { Constructor } from "../types";

class StoreRegistry {
    private _config: Map<string, Constructor<Model>> & Map<Constructor<Model>, string> = new Map();

    public register(code: string, constructor: Constructor<Model>) {
        this._config.set(code, constructor);
        this._config.set(constructor, code);
    }

    public query(code: string): Constructor<Model> | undefined
    public query(constructor: Constructor<Model>): string | undefined
    public query(arg: string | Constructor<Model>): Constructor<Model> | string | undefined {
        if (typeof arg === 'string') return this._config.get(arg);
        else return this._config.get(arg)
    }
}
export const storeRegistry = new StoreRegistry();

