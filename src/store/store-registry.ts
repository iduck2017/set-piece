import { Model } from "../model";
import { Constructor } from "../types";

class StoreRegistry {
    private _config: Map<string, Constructor<Model>> & Map<Constructor<Model>, string> = new Map();

    public register(code: string, Constructor: Constructor<Model>) {
        this._config.set(code, Constructor);
        this._config.set(Constructor, code);
    }

    public getCode(Constructor: Constructor<Model>) {
        return this._config.get(Constructor);
    }

    public getConstructor(code: string) {
        return this._config.get(code)
    }
}

export const storeRegistry = new StoreRegistry();

