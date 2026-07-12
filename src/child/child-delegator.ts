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
            const output = handler.apply(this, args);
            this.locked = false;
            return output;
        }
        useAction()(prototype, key, descriptor)
    }
}

/**
 * Proxies child values so parent ownership stays in sync with mutations.
 */
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
        const child = origin.pop();
        if (child) child._internal.unmount();
        return child;
    }

    /**
     * Push children and mount them to the parent.
     *
     * @param origin - Proxied child array.
     * @param children - Child models to append.
     * @returns New array length.
     */
    @useLock()
    private push(origin: Model[], ...children: Model[]) {
        const length = origin.push(...children);
        children.forEach(item => item._internal.mount(this.parent));
        return length;
    }

    /**
     * Shift a child and unmount it from the parent.
     *
     * @param origin - Proxied child array.
     * @returns Removed child model, if any.
     */
    @useLock()
    private shift(origin: Model[]) {
        const child = origin.shift();
        if (child) child._internal.unmount();
        return child;
    }

    /**
     * Unshift children and mount them to the parent.
     *
     * @param origin - Proxied child array.
     * @param children - Child models to prepend.
     * @returns New array length.
     */
    @useLock()
    private unshift(origin: Model[], ...children: Model[]) {
        const length = origin.unshift(...children);
        children.forEach(item => item._internal.mount(this.parent));
        return length;
    }

    /**
     * Replace child ranges while updating mount relationships.
     *
     * Removed children are unmounted, and inserted children are mounted to the
     * owning parent.
     *
     * @param origin - Proxied child array.
     * @param start - Start index for replacement.
     * @param deleteCount - Number of items to remove.
     * @param children - Child models to insert.
     * @returns Removed child models.
     */
    @useLock()
    private splice(
        origin: Model[], 
        start: number, 
        deleteCount: number, 
        ...children: Model[]
    ) {
        const removed = origin.slice(start, start + deleteCount);
        const items = origin.splice(start, deleteCount, ...children);
        removed.forEach(item => item._internal.unmount());
        children.forEach(item => item._internal.mount(this.parent));
        return items;
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
            /** Proxy child arrays so ownership follows in-place mutations. */
            this.value = new Proxy(value, {
                get: (origin, index) => {
                    /** Replace mutating helpers with mount-aware wrappers. */
                    if (index === 'pop') return this.pop.bind(this, origin);
                    if (index === 'push') return this.push.bind(this, origin);
                    if (index === 'fill') return this.fill.bind(this, origin);
                    if (index === 'shift') return this.shift.bind(this, origin);
                    if (index === 'unshift') return this.unshift.bind(this, origin);
                    if (index === 'splice') return this.splice.bind(this, origin);
                    return Reflect.get(origin, index)
                },
                set: (origin, index, next) => {
                    /** Direct index writes replace one child relationship. */
                    const prev = Reflect.get(origin, index);
                    Reflect.set(origin, index, next);
                    if (this._locked) return true;
                    if (prev instanceof Model) prev._internal.unmount();
                    if (next instanceof Model) next._internal.mount(this.parent);
                    return true;
                },
                deleteProperty: (origin, index) => {
                    /** Direct deletes detach the removed child. */
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
