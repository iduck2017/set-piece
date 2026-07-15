import { useBlink } from "../hooks/use-blink";
import { Tag } from "../tag/tag-registry";
import { depService } from "./dep-service";

/**
 * Create a method decorator that reports mutations after proxy helpers run.
 *
 * The decorated helper performs the actual array/object operation first, then
 * registers the owning dependency tag so downstream resolvers can react.
 *
 * @returns Method decorator for dependency proxy helper methods.
 */
function useProxy<P extends any[], R = any>() {
    return function(
        prototype: unknown,
        key: unknown,
        descriptor: TypedPropertyDescriptor<(...args: P) => R>
    ) {
        const handler = descriptor.value;
        if (!handler) return;
        descriptor.value = function(this: DepDelegator, ...args: P) {
            const output = handler.apply(this, args);
            depService.register(this.tag);
            return output;
        }
        useBlink()(prototype, key, descriptor);
        return descriptor;
    }
}

/**
 * Proxies mutable dependency values so in-place edits notify dependents.
 */
export class DepDelegator {
    public readonly value: unknown;

    /**
     * Remove the last array item and notify dependents.
     *
     * @param origin - Proxied array value.
     * @returns Removed array item.
     */
    @useProxy()
    private pop(origin: unknown[]) {
        return origin.pop();
    }

    /**
     * Append array items and notify dependents.
     *
     * @param origin - Proxied array value.
     * @param items - Items to append.
     * @returns New array length.
     */
    @useProxy()
    private push(origin: unknown[], ...items: unknown[]) {
        return origin.push(...items);
    }

    /**
     * Remove the first array item and notify dependents.
     *
     * @param origin - Proxied array value.
     * @returns Removed array item.
     */
    @useProxy()
    private shift(origin: unknown[]) {
        return origin.shift();
    }

    /**
     * Prepend array items and notify dependents.
     *
     * @param origin - Proxied array value.
     * @param items - Items to prepend.
     * @returns New array length.
     */
    @useProxy()
    private unshift(origin: unknown[], ...items: unknown[]) {
        return origin.unshift(...items);
    }

    /**
     * Replace an array range and notify dependents.
     *
     * @param origin - Proxied array value.
     * @param start - Start index for replacement.
     * @param deleteCount - Number of items to remove.
     * @param items - Items to insert.
     * @returns Removed array items.
     */
    @useProxy()
    private splice(
        origin: unknown[], 
        start: number, 
        deleteCount: number, 
        ...items: unknown[]
    ) {
        return origin.splice(start, deleteCount, ...items);
    }

    /**
     * Fill an array range and notify dependents.
     *
     * @param origin - Proxied array value.
     * @param item - Value to write into the range.
     * @param start - Optional start index.
     * @param end - Optional end index.
     * @returns The mutated array.
     */
    @useProxy()
    private fill(
        origin: unknown[],
        item: unknown,
        start?: number,
        end?: number
    ) {
        return origin.fill(item, start, end);
    }

    /**
     * Handle direct proxy assignment and notify dependents.
     *
     * @param origin - Proxied object value.
     * @param index - Property key being written.
     * @param next - Value being assigned.
     * @returns True when the proxy assignment succeeds.
     */
    @useProxy()
    private set(origin: object, index: string | symbol, next: unknown) {
        Reflect.set(origin, index, next);
        return true;
    }

    /**
     * Handle direct proxy deletion and notify dependents.
     *
     * @param origin - Proxied object value.
     * @param index - Property key being deleted.
     * @returns True when the proxy deletion succeeds.
     */
    @useProxy()
    private del(origin: object, index: string | symbol) {
        return Reflect.deleteProperty(origin, index);
    }

    /**
     * Proxy mutable array/object values so in-place edits become reactive.
     *
     * Array values are proxied to intercept mutating helpers and direct writes.
     * Non-array values pass through unchanged.
     *
     * @param origin - Raw value assigned to a dependency-backed property.
     * @param tag - Dependency tag to notify when the proxy mutates.
     */
    constructor(origin: unknown, public readonly tag: Tag) {
        if (origin instanceof Array) {
            /** Proxy arrays so helpers and index writes both become reactive. */
            this.value = new Proxy(origin, {
                get: (origin, index) => {
                    /** Replace mutating helpers with tagged wrappers. */
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
        } else {
            /** Non-array values are already handled by the property setter. */
            this.value = origin;
        }
    }
}
