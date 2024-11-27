import { Method } from "@/type/base";

export class SafeArray<T> extends Array<T> {
    map(handler: any) {
        const result: any = [ ...this ].map(handler);
        return result;
    }
    
    forEach(handler: any) {
        const result: any = [ ...this ].forEach(handler);
        return result;
    }
}

export class FormattedArray<A = any, B = any> extends SafeArray<any> {
    private _lock: boolean = false;

    private _getter: (origin: A) => B;
    private _setter: (value: B) => A;

    private static useLock() {
        return function (
            target: FormattedArray,
            key: string,
            descriptor: TypedPropertyDescriptor<Method>
        ): TypedPropertyDescriptor<Method> {
            const handler = descriptor.value;
            descriptor.value = function(this: FormattedArray, ...args: any[]) {
                this._lock = true;
                const result = handler?.apply(this, args);
                this._lock = false;
                return result;
            };
            return descriptor;
        };
    }

    constructor(
        getter: (origin: A) => B,
        setter: (origin: B) => A,
        ...props: any[]
    ) {
        super(...props);
        this._getter = getter;
        this._setter = setter;
        return new Proxy(this, {
            get: (target, key: any) => {
                if (this._lock) return target[key];
                if (isNaN(Number(key))) return target[key];
                return this._getter(target[key]);
            },
            set: (target, key: any, value: any) => {
                if (this._lock) target[key] = value;
                else if (isNaN(Number(key))) target[key] = value;
                else target[key] = this._setter(value);
                return true;
            }
        });
    }
    
    @FormattedArray.useLock()
    pop() {
        return this._getter(super.pop());
    }

    @FormattedArray.useLock()
    push(...items: any[]) {
        return super.push(
            ...items.map(item => this._setter(item))
        );
    }

    @FormattedArray.useLock()
    shift() {
        return this._getter(super.shift());
    }

    @FormattedArray.useLock()
    unshift(...items: any[]) {
        return super.unshift(
            ...items.map(item => this._setter(item))
        );
    }

    @FormattedArray.useLock()
    splice(index: number, count: number, ...next: any[]) {
        const prev = super.splice(
            index,
            count,
            ...next.map(item => this._setter(item))
        );
        return prev.map(item => this._getter(item));
    }
}


export class ObservedArray<T = any> extends SafeArray<T> {
    private _lock: boolean = false;

    private _listener: (event: {
        prev?: T[] | T,
        next?: T[] | T
    }) => void;

    private static useLock() {
        return function (
            target: ObservedArray,
            key: string,
            descriptor: TypedPropertyDescriptor<Method>
        ): TypedPropertyDescriptor<Method> {
            const handler = descriptor.value;
            descriptor.value = function(this: ObservedArray, ...args: any[]) {
                this._lock = true;
                const result = handler?.apply(this, args);
                this._lock = false;
                return result;
            };
            return descriptor;
        };
    }

    constructor(
        listener: (event: {
            prev?: T[] | T,
            next?: T[] | T
        }) => void,
        ...props: any[]
    ) {
        super(...props);
        this._listener = listener;
        return new Proxy(this, {
            set: (target, key: any, value: any) => {
                const prev = target[key];
                target[key] = value;
                if (this._lock) return true;
                if (isNaN(Number(key))) return true;
                this._listener({ 
                    prev,
                    next: value 
                });
                return true;
            },
            deleteProperty: (target, key: any) => {
                const value = target[key];
                delete target[key];
                if (this._lock) return true;
                if (this._listener) {
                    this._listener({ 
                        prev: value,
                        next: undefined 
                    });
                }
                return true;
            }
        });
    }
    
    @ObservedArray.useLock()
    pop() {
        const prev = super.pop();
        this._listener({  prev });
        return prev;
    }

    @ObservedArray.useLock()
    push(...next: T[]) {
        const result = super.push(...next);
        this._listener({ next });
        return result;
    }

    @ObservedArray.useLock()
    shift() {
        const prev = super.shift();
        this._listener({  prev });
        return prev;
    }

    @ObservedArray.useLock()
    unshift(...next: T[]) {
        const result = super.unshift(...next);
        this._listener({ next });
        return result;
    }

    @ObservedArray.useLock()
    splice(index: number, count: number, ...next: T[]) {
        const prev = super.splice(index, count, ...next);
        this._listener({ 
            prev,
            next
        });
        return prev;
    }

    init(listener: (event: {
        prev?: T[],
        next?: T[]
    }) => unknown) {
        this._listener = listener;
    }

}
