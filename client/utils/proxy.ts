import { Base, KeyOf } from "./base";

export namespace Delegator {
    export function automic<
        T extends Base.Map
    >(
        initValue: (key: KeyOf<T>) => T[KeyOf<T>]
    ): T {
        return new Proxy({} as T, {
            get: (origin, key: KeyOf<T>) => {
                if (!origin[key]) {
                    origin[key] = initValue(key);
                }
                return origin[key];
            },
            set: () => false,
            deleteProperty: () => false
        });
    }

    export function readonly<T extends Base.Map>(
        origin: T
    ): Readonly<T> {
        return new Proxy(origin, {
            set: () => false,
            deleteProperty: () => false
        });
    }

    export function traverse<
        B extends Record<K, any>,
        A extends Record<K, any>,
        K extends string,
    >(
        raw: A,
        initValue: (value: A[K], key: K) => B[K]
    ): Readonly<B> {
        const result = {} as B;
        Object.keys(result).forEach((
            key: K
        ) => {
            if (raw[key] !== undefined) {
                result[key] = initValue(raw[key], key);
            }
        });
        return result;
    }
}