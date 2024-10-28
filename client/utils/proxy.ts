import { Base, KeyOf, ValueOf } from "./base";

export namespace Delegator {
    export function automicMap<
        T extends Base.Map
    >(
        getter: (key: KeyOf<T>) => T[KeyOf<T>]
    ): T {
        return new Proxy({} as T, {
            get: (origin, key: KeyOf<T>) => {
                if (!origin[key]) {
                    origin[key] = getter(key);
                }
                return origin[key];
            },
            set: () => false,
            deleteProperty: () => false
        });
    }

    export function readonlyMap<T extends Base.Map>(
        origin: T
    ): Readonly<T> {
        return new Proxy(origin, {
            set: () => false,
            deleteProperty: () => false
        });
    }

    export function controlledMap<T extends Record<string, any>>(
        origin: T,
        listener: (
            key: KeyOf<T>,
            prev?: ValueOf<T>,
            next?: ValueOf<T>
        ) => void
    ): T {
        return new Proxy(origin, {
            set: (target, key: KeyOf<T>, value) => {
                const prev = target[key];
                const next = target[key] = value;
                listener(key, prev, next);
                return true;
            },
            deleteProperty: (target, key: KeyOf<T>) => {
                const value = target[key];
                delete target[key];
                listener(key, value, undefined);
                return true;
            }
        });
    }
    
    
}