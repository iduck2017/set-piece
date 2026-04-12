import { useMicroTask } from "../task/use-micro-task";
import { Tag } from "../tag/tag-registry";
import { depService } from "./dep-service";

function useTask<P extends any[], R = any>() {
    return function(
        prototype: unknown,
        key: unknown,
        descriptor: TypedPropertyDescriptor<(...args: P) => R>
    ) {
        const method = descriptor.value;
        if (!method) return;
        descriptor.value = function(this: DepDelegator, ...args: P) {
            const result = method.apply(this, args);
            console.log(`Dep changed: ${this.tag.name}.${key}`);
            depService.register(this.tag);
            return result;
        }
        useMicroTask()(prototype, key, descriptor);
        return descriptor;
    }
}

export class DepDelegator {
    public readonly value: unknown;

    @useTask()
    private pop(origin: unknown[]) {
        return origin.pop();
    }

    @useTask()
    private push(origin: unknown[], ...items: unknown[]) {
        return origin.push(...items);
    }

    @useTask()
    private shift(origin: unknown[]) {
        return origin.shift();
    }

    @useTask()
    private unshift(origin: unknown[], ...items: unknown[]) {
        return origin.unshift(...items);
    }

    @useTask()
    private splice(
        origin: unknown[], 
        start: number, 
        count: number, 
        ...items: unknown[]
    ) {
        return origin.splice(start, count, ...items);
    }

    @useTask()
    private fill(
        origin: unknown[],
        item: unknown,
        start?: number,
        end?: number
    ) {
        return origin.fill(item, start, end);
    }

    @useTask()
    private set(origin: object, index: string | symbol, next: unknown) {
        Reflect.set(origin, index, next);
        return true;
    }

    @useTask()
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
