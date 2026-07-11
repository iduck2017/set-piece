import { useBlink } from "../action/blink-manager";
import { Tag } from "../tag/tag-registry";
import { depService } from "./dep-service";

function useProxy<P extends any[], R = any>() {
    return function(
        prototype: unknown,
        key: unknown,
        descriptor: TypedPropertyDescriptor<(...args: P) => R>
    ) {
        const handler = descriptor.value;
        if (!handler) return;
        descriptor.value = function(this: DepDelegator, ...args: P) {
            const result = handler.apply(this, args);
            // console.log(`Dep changed: ${this.tag.name}.${key}`);
            depService.register(this.tag);
            return result;
        }
        useBlink()(prototype, key, descriptor);
        return descriptor;
    }
}

export class DepDelegator {
    public readonly value: unknown;

    @useProxy()
    private pop(origin: unknown[]) {
        return origin.pop();
    }

    @useProxy()
    private push(origin: unknown[], ...items: unknown[]) {
        return origin.push(...items);
    }

    @useProxy()
    private shift(origin: unknown[]) {
        return origin.shift();
    }

    @useProxy()
    private unshift(origin: unknown[], ...items: unknown[]) {
        return origin.unshift(...items);
    }

    @useProxy()
    private splice(
        origin: unknown[], 
        start: number, 
        count: number, 
        ...items: unknown[]
    ) {
        return origin.splice(start, count, ...items);
    }

    @useProxy()
    private fill(
        origin: unknown[],
        item: unknown,
        start?: number,
        end?: number
    ) {
        return origin.fill(item, start, end);
    }

    @useProxy()
    private set(origin: object, index: string | symbol, next: unknown) {
        Reflect.set(origin, index, next);
        return true;
    }

    @useProxy()
    private del(origin: object, index: string | symbol) {
        return Reflect.deleteProperty(origin, index);
    }

    constructor(origin: unknown, public readonly tag: Tag) {
        if (origin instanceof Array) {
            this.value = new Proxy(origin, {
                get: (origin, index) => {
                    if (index === 'pop') return this.pop.bind(this, origin);
                    if (index === 'push') return this.push.bind(this, origin);
                    if (index === 'shift') return this.shift.bind(this, origin);
                    if (index === 'unshift') return this.unshift.bind(this, origin);
                    if (index === 'splice') return this.splice.bind(this, origin);
                    if (index === 'fill') return this.fill.bind(this, origin);
                    return Reflect.get(origin, index);
                },
                set: this.set.bind(this),
                deleteProperty: this.del.bind(this)
            });
        } else this.value = origin;
    }
}
