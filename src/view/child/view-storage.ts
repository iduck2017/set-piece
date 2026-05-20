import { View } from "..";

const storage: WeakMap<View, Map<string, unknown>> = new WeakMap();

export const viewStorage = {
    get(view: View, key: string): unknown {
        return storage.get(view)?.get(key);
    },
    set(view: View, key: string, value: unknown): void {
        let map = storage.get(view);
        if (!map) {
            map = new Map();
            storage.set(view, map);
        }
        map.set(key, value);
    },
}
