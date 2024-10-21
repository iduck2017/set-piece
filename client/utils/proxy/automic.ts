import { Base, KeyOf, ValueOf } from "../../type";

export function AutomicProxy<T extends Base.Dict>(
    initValue: (key: KeyOf<T>) => ValueOf<T>
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