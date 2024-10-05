import { Base, KeyOf } from "../type";

export function initAutomicProxy<T extends Base.Dict>(
    get: (key: KeyOf<T>) => T[KeyOf<T>],
    origin = {}
): T {
    return new Proxy(origin as T, {
        get: (origin, key: KeyOf<T>) => {
            if (!origin[key]) {
                origin[key] = get(key);
            }
            return origin[key];
        },
        set: () => false,
        deleteProperty: () => false
    });
}

export function initReadonlyProxy<T extends Base.Dict>(
    origin: T
): T {
    return new Proxy(origin, {
        set: () => false,
        deleteProperty: () => false
    });
}