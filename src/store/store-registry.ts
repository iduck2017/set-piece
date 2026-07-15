import { Model } from "../model";
import { Constructor } from "../types";

/**
 * Maps model constructors to stable persistence codes.
 */
class StoreRegistry {
    private _types: Map<string, Constructor<Model>> & Map<Constructor<Model>, string> = new Map();

    /**
     * Associate a persistence code with a model constructor.
     *
     * The registry stores both directions so save and load can use the same
     * structure.
     *
     * @param code - Stable serialized type code.
     * @param ModelCtor - Model constructor represented by the code.
     * @returns Nothing.
     */
    public register(code: string, ModelCtor: Constructor<Model>) {
        this._types.set(code, ModelCtor);
        this._types.set(ModelCtor, code);
    }

    public query(ModelCtor: Constructor<Model>): string;
    public query(code: string): Constructor<Model>
    /**
     * Look up either the code for a constructor or the constructor for a code.
     *
     * @param target - Model constructor or serialized type code.
     * @returns The matching code or constructor.
     */
    public query(target: any): any {
        return this._types.get(target);
    }

}

export const storeRegistry = new StoreRegistry();
