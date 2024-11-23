import { Base, KeyOf, ValueOf } from "../type/base";

export namespace Delegator {
    export function Automic<
        T extends Base.Dict
    >(
        getter: (key: KeyOf<T>) => T[KeyOf<T>],
        origin?: T
    ): T {
        return new Proxy(origin || {} as T, {
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

    export function ControlledDict<T extends Record<string, any>>(
        origin: T,
        onChange: (event: {
            key: KeyOf<T>,
            prev?: ValueOf<T>,
            next?: ValueOf<T>
        }) => void
    ): T {
        return new Proxy(origin, {
            set: (target, key: KeyOf<T>, value) => {
                const prev = target[key];
                const next = target[key] = value;
                if (prev === next) return false;
                onChange({ 
                    key,
                    prev,
                    next 
                });
                return true;
            },
            deleteProperty: (target, key: KeyOf<T>) => {
                const value = target[key];
                delete target[key];
                if (value === undefined) return false;
                onChange({
                    key,
                    prev: value,
                    next: undefined
                });
                return true;
            }
        });
    }
        
    export function ControlledList<T>(
        origin: T[] | undefined,
        handleUpdate: (event: {
            prev?: T[] | T,
            next?: T[] | T
        }) => void
    ): T[] {
        let _lock: boolean = false;
        const useLock = <T extends Base.Func>(run: T) => {
            return (...args: Parameters<T>): ReturnType<T> => {
                _lock = true;
                const result = run(...args);
                _lock = false;
                return result;
            };
        };

        const result = new Proxy(origin || [], {
            set: (target, key: any, value: any) => {
                const prev = target[key];
                target[key] = value;
                if (_lock) return true;
                if (isNaN(Number(key))) return true;
                handleUpdate({
                    prev,
                    next: value
                });
                return true;
            },
            deleteProperty: (target, key: any) => {
                const value = target[key];
                delete target[key];
                if (_lock) return true;
                handleUpdate({
                    prev: value,
                    next: undefined
                });
                return true;
            }
        });

        result.pop = useLock(() => {
            const value = Array.prototype.pop.call(result);
            if (value) {
                handleUpdate({
                    prev: value,
                    next: undefined
                });
            }
            return value;
        });

        result.push = useLock((...addList: T[]) => {
            const index = Array.prototype.push.call(
                result, 
                ...addList
            );
            handleUpdate({
                prev: undefined,
                next: addList
            });
            return index;
        });

        result.shift = useLock(() => {
            const value = Array.prototype.shift.call(result);
            if (value) {
                handleUpdate({
                    prev: value,
                    next: undefined
                });
            }
            return value;
        });

        result.unshift = useLock((...addList: T[]) => {
            const index = Array.prototype.unshift.call(
                result, 
                ...addList
            );
            handleUpdate({
                prev: undefined,
                next: addList
            });
            return index;
        });

        result.splice = useLock((
            start: number,
            removeCnt: number,
            ...addList: T[]
        ) => {
            const removeList = Array.prototype.splice.call(
                result, 
                start,
                removeCnt,
                ...addList
            );
            handleUpdate({
                prev: removeList,
                next: addList
            });
            return removeList;
        });

        return result;
    }
}