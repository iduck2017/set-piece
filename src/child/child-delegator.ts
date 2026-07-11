import { useAction } from "../hooks/use-action";
import { Model } from "../model";

/**
 * Create a method decorator that locks proxy traps during array helpers.
 *
 * Array helpers such as `push` already mount/unmount children explicitly. The
 * lock prevents the proxy `set` and `deleteProperty` traps from doing the same
 * work a second time.
 *
 * @returns Method decorator for child array helper methods.
 */
function useLock<P extends any[], R = any>() {
    return function(
        prototype: unknown,
        key: unknown,
        descriptor: TypedPropertyDescriptor<(...args: P) => R>
    ) {
        const handler = descriptor.value;
        if (!handler) return;
        descriptor.value = function(this: ChildDelegator, ...args: P) {
            this.locked = true;
            const result = handler.apply(this, args);
            this.locked = false;
            return result;
        }
        useAction()(prototype, key, descriptor)
    }
}

export class ChildDelegator {
    public readonly value: unknown;
    
    protected _locked;
    public set locked(value: boolean) {
        this._locked = value;
    }

    /**
     * Pop a child and unmount it from the parent.
     *
     * @param origin - Proxied child array.
     * @returns Removed child model, if any.
     */
    @useLock()
    private pop(origin: Model[]) {
        const result = origin.pop();
        if (result) result._internal.unmount();
        return result;
    }

    /**
     * Push children and mount them to the parent.
     *
     * @param origin - Proxied child array.
     * @param next - Child models to append.
     * @returns New array length.
     */
    @useLock()
    private push(origin: Model[], ...next: Model[]) {
        const result = origin.push(...next);
        next.forEach(item => item._internal.mount(this.parent));
        return result;
    }

    /**
     * Shift a child and unmount it from the parent.
     *
     * @param origin - Proxied child array.
     * @returns Removed child model, if any.
     */
    @useLock()
    private shift(origin: Model[]) {
        const result = origin.shift();
        if (result) result._internal.unmount();
        return result;
    }

    /**
     * Unshift children and mount them to the parent.
     *
     * @param origin - Proxied child array.
     * @param next - Child models to prepend.
     * @returns New array length.
     */
    @useLock()
    private unshift(origin: Model[], ...next: Model[]) {
        const result = origin.unshift(...next);
        next.forEach(item => item._internal.mount(this.parent));
        return result;
    }

    /**
     * Replace child ranges while updating mount relationships.
     *
     * Removed children are unmounted, and inserted children are mounted to the
     * owning parent.
     *
     * @param origin - Proxied child array.
     * @param start - Start index for replacement.
     * @param count - Number of items to remove.
     * @param next - Child models to insert.
     * @returns Removed child models.
     */
    @useLock()
    private splice(
        origin: Model[], 
        start: number, 
        count: number, 
        ...next: Model[]
    ) {
        const prev = origin.slice(start, start + count);
        const result = origin.splice(start, count, ...next);
        prev.forEach(item => item._internal.unmount());
        next.forEach(item => item._internal.mount(this.parent));
        return result;
    }

    /**
     * Keep fill inert because one value would imply ambiguous ownership.
     *
     * @param origin - Proxied child array.
     * @returns The unchanged array.
     */
    private fill(origin: Model[]) { 
        return origin 
    }

    /**
     * Proxy child arrays so in-place edits keep parent links correct.
     *
     * Single model values pass through unchanged. Array values are proxied so
     * direct index assignment, deletion, and known array helpers mount or
     * unmount models as ownership changes.
     *
     * @param value - Original child value assigned to the decorated property.
     * @param parent - Model that owns the child property.
     */
    constructor(value: unknown, private readonly parent: Model) {
        if (value instanceof Array) {
            this.value = new Proxy(value, {
                get: (origin, index) => {
                    if (index === 'pop') return this.pop.bind(this, origin);
                    if (index === 'push') return this.push.bind(this, origin);
                    if (index === 'fill') return this.fill.bind(this, origin);
                    if (index === 'shift') return this.shift.bind(this, origin);
                    if (index === 'unshift') return this.unshift.bind(this, origin);
                    if (index === 'splice') return this.splice.bind(this, origin);
                    return Reflect.get(origin, index)
                },
                set: (origin, index, next) => {
                    const prev = Reflect.get(origin, index);
                    Reflect.set(origin, index, next);
                    if (this._locked) return true;
                    if (prev instanceof Model) prev._internal.unmount();
                    if (next instanceof Model) next._internal.mount(this.parent);
                    return true;
                },
                deleteProperty: (origin, index) => {
                    const prev = Reflect.get(origin, index);
                    Reflect.deleteProperty(origin, index);
                    if (this._locked) return true;
                    if (prev instanceof Model) prev._internal.unmount();
                    return true;
                }
            });
        } 
        else this.value = value;
        this._locked = false;
    }
}
