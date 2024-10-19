import { Base, KeyOf, ValueOf } from "../type";

export namespace Delegator {
    export function AutomicDict<T extends Base.Dict>(
        get: (key: KeyOf<T>) => ValueOf<T>
    ): T {
        return new Proxy({} as T, {
            get: (origin, key: KeyOf<T>) => {
                if (!origin[key]) origin[key] = get(key);
                return origin[key];
            },
            set: () => false,
            deleteProperty: () => false
        });
    }

    export function ReadonlyDict<T extends Base.Dict>(
        origin: T
    ): Readonly<T> {
        return new Proxy(origin, {
            set: () => false,
            deleteProperty: () => false
        });
    }

}