import { Model } from "../model";

export type StoreRowConfig = [(value: any) => any, (value: any) => any];
export type StoreRowConfigMap = Map<string, StoreRowConfig>;

class StoreRowRegistry {
    private _context: Map<Function, StoreRowConfigMap> = new Map();

    public register(
        prototype: Model, 
        key: string, 
        parser: (value: any) => any, 
        generator: (value: any) => any
    ) {
        const configMap: StoreRowConfigMap = this._context.get(prototype.constructor) ?? new Map();
        configMap.set(key, [parser, generator]);
        this._context.set(prototype.constructor, configMap);
    }

    public query(constructor: Function): StoreRowConfigMap {
        return this._context.get(constructor) ?? new Map();
    }
}

export const storeRowRegistry = new StoreRowRegistry();
