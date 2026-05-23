import { Model } from "../model";
import { Constructor } from "../types";

class StoreRegistry {
    private _config: Map<string, Constructor<Model>> & Map<Constructor<Model>, string> = new Map();

    public register(code: string, Constructor: Constructor<Model>) {
        this._config.set(code, Constructor);
        this._config.set(Constructor, code);
    }

    public query(Constructor: Constructor<Model>): string;
    public query(code: string): Constructor<Model>
    public query(arg: any): any {
        return this._config.get(arg);
    }

}

export const storeRegistry = new StoreRegistry();

