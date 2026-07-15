import { Model } from "../model";

export type StoreRowConfig = [(value: any) => any, (value: any) => any];
export type StoreRowConfigMap = Map<string, StoreRowConfig>;

/**
 * Stores per-field serializers used by store persistence.
 */
class StoreRowRegistry {
    private _rows: Map<Function, StoreRowConfigMap> = new Map();

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
        const rows: StoreRowConfigMap = this._rows.get(prototype.constructor) ?? new Map();
        rows.set(key, [parser, generator]);
        this._rows.set(prototype.constructor, rows);
    }

    /**
     * Collect inherited row serializers for a model constructor.
     *
     * @param ctor - Constructor whose hierarchy should be inspected.
     * @returns Map from property key to parser/generator pair.
     */
    public query(ctor: Function): StoreRowConfigMap {
        const rows: StoreRowConfigMap = new Map();
        let currentCtor: any = ctor;
        while (currentCtor) {
            const current: StoreRowConfigMap = this._rows.get(currentCtor) ?? new Map();
            current.forEach((config, key) => {
                if (rows.has(key)) return;
                rows.set(key, config);
            });
            currentCtor = Object.getPrototypeOf(currentCtor);
        }
        return rows;
    }
}

export const storeRowRegistry = new StoreRowRegistry();
