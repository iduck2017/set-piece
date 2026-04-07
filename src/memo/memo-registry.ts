import { Model } from "../model";
import { AbstractConstructor } from "../types";
import { getTypes } from "../utils/get-types";

class MemoRegistry {
    private _context: Map<AbstractConstructor<Model>, string[]> = new Map();

    public register(prototype: Model, key: string) {
        const type: any = prototype.constructor;
        const keys = this._context.get(type) ?? [];
        keys.push(key);
        this._context.set(type, keys);
    }

    public query(prototype: Model): string[] {
        const types = getTypes(prototype);
        const keys: string[] = [];
        types.forEach(type => {
            const subKeys = this._context.get(type) ?? [];
            subKeys.forEach(key => {
                if (keys.includes(key)) return;
                keys.push(key);
            })
        })
        return keys;
    }
}

export const memoRegistry = new MemoRegistry();
