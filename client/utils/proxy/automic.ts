import { Base, KeyOf } from "../../type";

export function AutomicProxy<T extends Record<Base.Key, any>>(
    initValue: (key: KeyOf<T>) => T[KeyOf<T>]
): T {
    return new Proxy({} as T, {
        get: (origin, key: KeyOf<T>) => {
            if (!origin[key]) origin[key] = initValue(key);
            return origin[key];
        },
        set: () => false,
        deleteProperty: () => false
    });
}