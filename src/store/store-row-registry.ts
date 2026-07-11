import { Model } from "../model";

export type StoreRowConfig = [(value: any) => any, (value: any) => any];
export type StoreRowConfigMap = Map<string, StoreRowConfig>;

class StoreRowRegistry {
    private _context: Map<Function, StoreRowConfigMap> = new Map();

    /**
     * Register row-level serializers for a model property.
     *
     * @param prototype - Prototype that owns the stored property.
     * @param key - Stored property key.
     * @param parser - Function used when loading serialized values.
     * @param generator - Function used when saving runtime values.
     * @returns Nothing.
     */
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

    /**
     * Collect inherited row serializers for a model constructor.
     *
     * @param constructor - Constructor whose hierarchy should be inspected.
     * @returns Map from property key to parser/generator pair.
     */
    public query(constructor: Function): StoreRowConfigMap {
        const result: StoreRowConfigMap = new Map();
        let Constructor: any = constructor;
        while (Constructor) {
            const subConfig: StoreRowConfigMap = this._context.get(Constructor) ?? new Map();
            subConfig.forEach((config, key) => {
                if (result.has(key)) return;
                result.set(key, config);
            });
            Constructor = Object.getPrototypeOf(Constructor);
        }
        return result;
    }
}

export const storeRowRegistry = new StoreRowRegistry();
