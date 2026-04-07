import { Field } from "../utils/field-registry";
import { depResolver } from "./dep-resolver";

export class DepDelegator {
    readonly value: unknown;

    private static useLock<P extends any[], R = any>() {
        return function(
            _prototype: unknown,
            _key: unknown,
            descriptor: TypedPropertyDescriptor<(...args: P) => R>
        ) {
            const method = descriptor.value;
            if (!method) return;
            descriptor.value = function(this: DepDelegator, ...args: P) {
                const result = method.apply(this, args);
                depResolver.resolve(this.field);
                return result;
            }
        }
    }

    @DepDelegator.useLock()
    private pop(origin: unknown[]) {
        return origin.pop();
    }

    @DepDelegator.useLock()
    private push(origin: unknown[], ...items: unknown[]) {
        return origin.push(...items);
    }

    @DepDelegator.useLock()
    private shift(origin: unknown[]) {
        return origin.shift();
    }

    @DepDelegator.useLock()
    private unshift(origin: unknown[], ...items: unknown[]) {
        return origin.unshift(...items);
    }

    @DepDelegator.useLock()
    private splice(
        origin: unknown[], 
        start: number, 
        count: number, 
        ...items: unknown[]
    ) {
        return origin.splice(start, count, ...items);
    }

    @DepDelegator.useLock()
    private fill(
        origin: unknown[],
        item: unknown,
        start?: number,
        end?: number
    ) {
        return origin.fill(item, start, end);
    }

    @DepDelegator.useLock()
    private set(origin: object, index: string | symbol, next: unknown) {
        return Reflect.set(origin, index, next);
    }

    @DepDelegator.useLock()
    private del(origin: object, index: string | symbol) {
        return Reflect.deleteProperty(origin, index);
    }

    constructor(value: unknown, private readonly field: Field) {
        if (value instanceof Array) {
            this.value = new Proxy(value, {
                get: (origin, index) => {
                    const value = Reflect.get(origin, index);
                    if (value === origin.pop) return this.pop.bind(this, origin);
                    if (value === origin.push) return this.push.bind(this, origin);
                    if (value === origin.shift) return this.shift.bind(this, origin);
                    if (value === origin.unshift) return this.unshift.bind(this, origin);
                    if (value === origin.splice) return this.splice.bind(this, origin);
                    if (value === origin.fill) return this.fill.bind(this, origin);
                    return value;
                },
                set: this.set.bind(this),
                deleteProperty: this.del.bind(this)
            });
        } else this.value = value;
    }
}
