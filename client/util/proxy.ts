import { Base, KeyOf, ValueOf } from "../type/base";
import { ObservedArray, FormattedArray } from "./array";

export namespace Delegator {
    export function Automic<T extends Base.Dict>(
        origin: any,
        getter: (key: KeyOf<T>) => T[KeyOf<T>]
    ): T {
        return new Proxy(origin, {
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
    
    export function Readonly<T extends Base.Dict>(
        origin: T
    ): Readonly<T> {
        return new Proxy(origin, {
            set: () => false,
            deleteProperty: () => false
        });
    }

    export function Formatted<A, B>(
        origin: any,
        getter: (value: A) => B,
        setter: (value: B) => A
    ): any {
        if (origin instanceof Array) {
            return new FormattedArray(
                getter, 
                setter,
                ...origin
            );
        } else {
            return new Proxy(origin, {
                get: (origin, key: string) => {
                    return getter(origin[key]);
                },
                set: (origin, key: string, value: B) => {
                    origin[key] = setter(value);
                    return true;
                }
            });
        }
    }

    export function Observed<T extends Base.Dict>(
        origin: T,
        listener: (event: {
            key?: string | number,
            prev?: ValueOf<T> | ValueOf<T>[],
            next?: ValueOf<T> | ValueOf<T>[],
        }) => void
    ): any {
        if (origin instanceof Array) {
            return new ObservedArray(listener, ...origin);
        } else {
            return new Proxy(origin, {
                set: (target, key: KeyOf<T>, value) => {
                    const prev = target[key];
                    const next = target[key] = value;
                    if (prev === next) return false;
                    listener({ 
                        key,
                        prev,
                        next 
                    });
                    return true;
                },
                deleteProperty: (target, key: string) => {
                    const value = target[key];
                    delete target[key];
                    if (value === undefined) return false;
                    listener({
                        key,
                        prev: value,
                        next: undefined
                    });
                    return true;
                }
            });
        }
    }
}