import { Base, KeyOf, ValueOf } from "../../type";

export function ControlledProxy<T extends Base.Dict>(
    origin: T,
    handleUpdate: (
        key: KeyOf<T>,
        value: ValueOf<T>,
        isRemoved?: boolean
    ) => void
): T {
    return new Proxy(origin, {
        set: (target, key: KeyOf<T>, value) => {
            target[key] = value;
            handleUpdate(key, value);
            return true;
        },
        deleteProperty: (target, key: KeyOf<T>) => {
            const value = target[key];
            delete target[key];
            handleUpdate(key, value, true);
            return true;
        }
    });
}

export function ControlledArray<T>(
    origin: T[] | undefined,
    handleUpdate: (
        value: T,
        isRemoved?: boolean
    ) => void
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
            handleUpdate(value);
            return true;
        },
        deleteProperty: (target, key: KeyOf<T[]>) => {
            const value = target[key] as T;
            delete target[key];
            if (_lock) return true;
            handleUpdate(value, true);
            return true;
        }
    });

    result.pop = useLock(() => {
        const value = result.pop();
        if (value) handleUpdate(value, true);
        return value;
    });

    result.push = useLock((...addList: T[]) => {
        const index = result.push(...addList);
        for (const value of addList) handleUpdate(value);
        return index;
    });

    result.shift = useLock(() => {
        const value = result.shift();
        if (value) handleUpdate(value, true);
        return value;
    });

    result.unshift = useLock((...addList: T[]) => {
        const index = result.unshift(...addList);
        for (const value of addList) handleUpdate(value);
        return index;
    });

    result.splice = useLock((
        start: number,
        removeCnt: number,
        ...addList: T[]
    ) => {
        const removeList = result.splice(start, removeCnt, ...addList);
        for (const value of removeList)  handleUpdate(value, true);
        for (const value of addList) handleUpdate(value);
        return removeList;
    });

    return result;
}

