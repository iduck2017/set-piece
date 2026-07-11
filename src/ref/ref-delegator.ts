import { useAction } from "../hooks/use-action";
import { Model } from "../model";
import { Tag } from "../tag/tag-registry";
import { refConsumerRegistry } from "./ref-consumer-registry";

/**
 * Create a method decorator that locks proxy traps during array helpers.
 *
 * Array helpers update ref holder links explicitly. The lock prevents proxy
 * traps from applying the same add/remove operation twice.
 *
 * @returns Method decorator for ref array helper methods.
 */
function useLock<P extends any[], R = any>() {
    return function(
        prototype: unknown,
        key: unknown,
        descriptor: TypedPropertyDescriptor<(...args: P) => R>
    ) {
        const handler = descriptor.value;
        if (!handler) return;
        descriptor.value = function(this: RefDelegator, ...args: P) {
            this.locked = true;
            const output = handler.apply(this, args);
            this.locked = false;
            return output;
        }
        useAction()(prototype, key, descriptor)
    }
}

export class RefDelegator {
    public readonly value: unknown;

    protected _locked;
    public set locked(value: boolean) {
        this._locked = value;
    }

    /**
     * Pop a ref and remove its holder relationship.
     *
     * @param origin - Proxied ref array.
     * @returns Removed model, if any.
     */
    @useLock()
    private pop(origin: Model[]) {
        const model = origin.pop();
        if (model instanceof Model) refConsumerRegistry.remove(model, this.tag);
        return model;
    }

    /**
     * Push refs and add holder relationships.
     *
     * @param origin - Proxied ref array.
     * @param refs - Referenced models to append.
     * @returns New array length.
     */
    @useLock()
    private push(origin: Model[], ...refs: Model[]) {
        const length = origin.push(...refs);
        refs.filter(item => item instanceof Model)
            .forEach(item => refConsumerRegistry.add(item, this.tag));
        return length;
    }

    /**
     * Shift a ref and remove its holder relationship.
     *
     * @param origin - Proxied ref array.
     * @returns Removed model, if any.
     */
    @useLock()
    private shift(origin: Model[]) {
        const model = origin.shift();
        if (model instanceof Model) refConsumerRegistry.remove(model, this.tag);
        return model;
    }

    /**
     * Unshift refs and add holder relationships.
     *
     * @param origin - Proxied ref array.
     * @param refs - Referenced models to prepend.
     * @returns New array length.
     */
    @useLock()
    private unshift(origin: Model[], ...refs: Model[]) {
        const length = origin.unshift(...refs);
        refs.filter(item => item instanceof Model)
            .forEach(item => refConsumerRegistry.add(item, this.tag));
        return length;
    }

    /**
     * Replace ref ranges while updating holder relationships.
     *
     * Removed refs are detached from the holder tag, and inserted refs are
     * attached to it.
     *
     * @param origin - Proxied ref array.
     * @param start - Start index for replacement.
     * @param deleteCount - Number of items to remove.
     * @param refs - Referenced models to insert.
     * @returns Removed models.
     */
    @useLock()
    private splice(
        origin: Model[],
        start: number,
        deleteCount: number,
        ...refs: Model[]
    ) {
        const removed = origin.slice(start, start + deleteCount);
        const items = origin.splice(start, deleteCount, ...refs);
        removed.filter(item => item instanceof Model)
            .forEach(item => refConsumerRegistry.remove(item, this.tag));
        refs.filter(item => item instanceof Model)
            .forEach(item => refConsumerRegistry.add(item, this.tag));
        return items;
    }

    /**
     * Keep fill inert because duplicated refs cannot be tracked precisely.
     *
     * @param origin - Proxied ref array.
     * @returns The unchanged array.
     */
    private fill(origin: Model[]) {
        return origin;
    }

    /**
     * Proxy ref arrays so in-place edits keep holder links correct.
     *
     * Single model values pass through unchanged. Array values are proxied so
     * direct index assignment, deletion, and known array helpers update
     * `RefConsumerRegistry`.
     *
     * @param value - Original ref value assigned to the decorated property.
     * @param tag - Tag for the property holding the reference.
     */
    constructor(value: unknown, private readonly tag: Tag) {
        if (value instanceof Array) {
            this.value = new Proxy(value, {
                get: (origin, index) => {
                    if (index === 'pop') return this.pop.bind(this, origin);
                    if (index === 'push') return this.push.bind(this, origin);
                    if (index === 'fill') return this.fill.bind(this, origin);
                    if (index === 'shift') return this.shift.bind(this, origin);
                    if (index === 'unshift') return this.unshift.bind(this, origin);
                    if (index === 'splice') return this.splice.bind(this, origin);
                    return Reflect.get(origin, index);
                },
                set: (origin, index, next) => {
                    const prev = Reflect.get(origin, index);
                    Reflect.set(origin, index, next);
                    if (this._locked) return true;
                    if (prev instanceof Model) refConsumerRegistry.remove(prev, this.tag);
                    if (next instanceof Model) refConsumerRegistry.add(next, this.tag);
                    return true;
                },
                deleteProperty: (origin, index) => {
                    const prev = Reflect.get(origin, index);
                    Reflect.deleteProperty(origin, index);
                    if (this._locked) return true;
                    if (prev instanceof Model) refConsumerRegistry.remove(prev, this.tag);
                    return true;
                }
            });
        }
        else this.value = value;
        this._locked = false;
    }
}
