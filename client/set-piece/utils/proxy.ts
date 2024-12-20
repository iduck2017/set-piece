import { Base } from "@/set-piece/types/base";

export namespace Delegator {
    export function Automic(
        origin: any,
        getter: Base.Func
    ) {
        const _origin: any = origin;
        return new Proxy(_origin, {
            get: (origin, key) => {
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

    export function Formatted(
        origin: Base.Dict,
        getter: Base.Func,
        setter: Base.Func
    ): any {
        if (origin instanceof Array) {
            let lock = false;
            const {
                push,
                pop,
                unshift,
                shift,
                splice
            } = origin;
            const useLock = function (handler: Base.Func) {
                return (...args: Base.List) => {
                    lock = true;
                    const result = handler(...args);
                    lock = false;
                    return result;
                };
            };
            const result = new Proxy(origin, {
                get: (target, key: any) => {
                    if (
                        lock || 
                        typeof key === "symbol" || 
                        isNaN(Number(key))
                    ) {
                        return target[key];
                    }
                    return getter(target[key]);
                },
                set: (target, key: any, value) => {
                    if (
                        lock || 
                        typeof key === "symbol" || 
                        isNaN(Number(key))
                    ) {
                        target[key] = value;
                        return true;
                    }
                    target[key] = setter(value);
                    return true;
                }
            });
            result.push = useLock((...next) => {  
                const index = push.apply(
                    origin, 
                    next.map(setter)
                );
                return index;
            });
            result.pop = useLock(() => {
                const prev = pop.apply(origin);
                return getter(prev);
            });
            result.unshift = useLock((...next) => {
                const index = unshift.apply(
                    origin, 
                    next.map(setter)
                );
                return index;
            });
            result.shift = useLock(() => {
                const prev = shift.apply(origin);
                return getter(prev);
            });
            result.splice = useLock((
                start: number, 
                count: number, 
                ...next
            ) => {
                const prev = splice.call(
                    origin, 
                    start,
                    count,
                    ...next.map(setter)
                );
                return prev.map(getter);
            });
            return result;
        } else {
            return new Proxy(origin, {
                get: (origin, key: string) => {
                    return getter(origin[key]);
                },
                set: (origin, key: string, value: any) => {
                    origin[key] = setter(value);
                    return true;
                }
            });
        }
    }

    export function Observed(
        origin: any,
        listener: (data: {
            key?: string | symbol,
            prev?: any | any[],
            next?: any | any[],
        }) => void
    ) {
        if (origin instanceof Array) {
            let lock = false;
            const {
                push,
                pop,
                unshift,
                shift,
                splice
            } = origin;
            const useLock = function (handler: Base.Func) {
                return (...args: Base.List) => {
                    lock = true;
                    const result = handler(...args);
                    lock = false;
                    return result;
                };
            };
            const result = new Proxy(origin, {
                set: (target, key: any, value) => {
                    const prev = target[key];
                    target[key] = value;
                    if (
                        lock || 
                        typeof key === "symbol" || 
                        isNaN(Number(key))
                    ) {
                        return true;
                    }
                    listener({ 
                        prev,
                        next: value 
                    });
                    return true;
                },
                deleteProperty: (target, key: any) => {
                    const value = target[key];
                    delete target[key];
                    if (lock) return true;
                    listener({ 
                        prev: value,
                        next: undefined 
                    });
                    return true;
                }
            });
            result.push = useLock((...next: Base.List) => {  
                const index = push.apply(origin, next);
                listener({ next });
                return index;
            });
            result.pop = useLock(() => {
                const prev = pop.apply(origin);
                listener({ prev });
                return prev;
            });
            result.unshift = useLock((...next: Base.List) => {
                const index = unshift.apply(origin, next);
                listener({ next });
                return index;
            });
            result.shift = useLock(() => {
                const prev = shift.apply(origin);
                listener({ prev });
                return prev;
            });
            result.splice = useLock((start: number, count: number, ...next: Base.List) => {
                const prev = splice.call(
                    origin, 
                    start,
                    count,
                    ...next
                );
                listener({ 
                    prev,
                    next 
                });
                return prev;
            });
            return result;
        } else {
            return new Proxy(origin, {
                set: (target, key, value) => {
                    const prev = target[key];
                    const next = target[key] = value;
                    if (prev === next) return true;
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
                    if (value === undefined) return true;
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