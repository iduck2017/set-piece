import { Base, KeyOf, ValueOf } from "../../type";

export function ControlledProxy<T extends Base.Dict>(
    origin: T,
    handleSet: (key: KeyOf<T>, value: ValueOf<T>) => void,
    handleRemove: (key: KeyOf<T>, value: ValueOf<T>) => void,
    handleUpdate?: (key: KeyOf<T>) => void
): T {
    return new Proxy(origin, {
        set: (target, key: KeyOf<T>, value) => {
            target[key] = value;
            handleSet(key, value);
            handleUpdate?.(key);
            return true;
        },
        deleteProperty: (target, key: KeyOf<T>) => {
            const value = target[key];
            delete target[key];
            handleRemove(key, value);
            handleUpdate?.(key);  
            return true;
        }
    });
}

export function ControlledArray<T>(
    origin: T[] | undefined,
    handleAdd: (value: T) => void,
    handleRemove: (value: T) => void,
    handleUpdate?: () => void
): T[] {
    let _lock: boolean = false;
    const useLock = (run: Base.Function) => {
        return () => {
            _lock = true;
            const result = run();
            _lock = false;
            return result;
        };
    };

    const result = new Proxy(origin || [], {
        set: (target, key: KeyOf<T[]>, value) => {
            target[key] = value;
            if (_lock) return true;
            if (isNaN(Number(key))) return true;
            handleAdd(value);
            handleUpdate?.();
            return true;
        },
        deleteProperty: (target, key: KeyOf<T[]>) => {
            const value = target[key] as T;
            delete target[key];
            if (_lock) return true;
            handleRemove(value);
            handleUpdate?.();
            return true;
        }
    });

    result.pop = useLock(() => {
        const value = result.pop();
        if (value) {
            handleRemove(value);
            handleUpdate?.();
        }
        return value;
    });

    result.push = useLock((...addList: T[]) => {
        const index = result.push(...addList);
        for (const value of addList) {
            handleAdd(value);
        }
        handleUpdate?.();
        return index;
    });

    result.shift = useLock(() => {
        const value = result.shift();
        if (value) {
            handleRemove(value);
            handleUpdate?.();
        }
        return value;
    });

    result.unshift = useLock((...addList: T[]) => {
        const index = result.unshift(...addList);
        for (const value of addList) {
            handleAdd(value);
        }
        handleUpdate?.();
        return index;
    });

    result.splice = useLock((
        start: number,
        removeCnt: number,
        ...addList: T[]
    ) => {
        const removeList = result.splice(start, removeCnt, ...addList);
        for (const value of removeList) {
            handleRemove(value);
        }
        for (const value of addList) {
            handleAdd(value);
        }
        handleUpdate?.();
        return removeList;
    });

    return result;
}

