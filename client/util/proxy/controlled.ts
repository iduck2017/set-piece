import { Base, KeyOf, ValueOf } from "../../type/base";

export function ControlledProxy<T extends Record<string, any>>(
    origin: T,
    handleUpdate: (
        key: KeyOf<T>,
        value: ValueOf<T>,
        isNew: boolean
    ) => void
): T {
    return new Proxy(origin, {
        set: (target, key: KeyOf<T>, value) => {
            target[key] = value;
            handleUpdate(key, value, true);
            return true;
        },
        deleteProperty: (target, key: KeyOf<T>) => {
            const value = target[key];
            delete target[key];
            handleUpdate(key, value, false);
            return true;
        }
    });
}

export function ControlledArray<T>(
    origin: T[] | undefined,
    handleUpdate: (
        value: T,
        isNew: boolean
    ) => void
): T[] {
    let _lock: boolean = false;
    const useLock = <T extends Base.Function>(run: T) => {
        return (...args: Parameters<T>): ReturnType<T> => {
            _lock = true;
            const result = run(...args);
            _lock = false;
            return result;
        };
    };

    const result = new Proxy(origin || [], {
        set: (target, key: KeyOf<T[]>, value) => {
            target[key] = value;
            if (_lock) return true;
            if (isNaN(Number(key))) return true;
            handleUpdate(value, true);
            return true;
        },
        deleteProperty: (target, key: any) => {
            const value = target[key];
            delete target[key];
            if (_lock) return true;
            handleUpdate(value, false);
            return true;
        }
    });

    result.pop = useLock(() => {
        const value = Array.prototype.pop.call(result);
        if (value) handleUpdate(value, false);
        return value;
    });

    result.push = useLock((...addList: T[]) => {
        const index = Array.prototype.push.call(
            result, 
            ...addList
        );
        for (const value of addList) handleUpdate(value, true);
        return index;
    });

    result.shift = useLock(() => {
        const value = Array.prototype.shift.call(result);
        if (value) handleUpdate(value, false);
        return value;
    });

    result.unshift = useLock((...addList: T[]) => {
        const index = Array.prototype.unshift.call(
            result, 
            ...addList
        );
        for (const value of addList) handleUpdate(value, true);
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
        for (const value of removeList)  handleUpdate(value, false);
        for (const value of addList) handleUpdate(value, true);
        return removeList;
    });

    return result;
}

