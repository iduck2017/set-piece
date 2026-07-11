import { Model } from "../model";
import { Constructor } from "../types";

class StoreRegistry {
    private _config: Map<string, Constructor<Model>> & Map<Constructor<Model>, string> = new Map();

    /**
     * Associate a persistence code with a model constructor.
     *
     * The registry stores both directions so save and load can use the same
     * structure.
     *
     * @param code - Stable serialized type code.
     * @param Constructor - Model constructor represented by the code.
     * @returns Nothing.
     */
    public register(code: string, Constructor: Constructor<Model>) {
        this._config.set(code, Constructor);
        this._config.set(Constructor, code);
    }

    public query(Constructor: Constructor<Model>): string;
    public query(code: string): Constructor<Model>
    /**
     * Look up either the code for a constructor or the constructor for a code.
     *
     * @param arg - Model constructor or serialized type code.
     * @returns The matching code or constructor.
     */
    public query(arg: any): any {
        return this._config.get(arg);
    }

}

export const storeRegistry = new StoreRegistry();
