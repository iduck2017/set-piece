import { View } from "../view";

export class ViewChildDelegator {
    public readonly value: unknown;

    private _locked = false;

    private pop(origin: View[]) {
        this._locked = true;
        const result = origin.pop();
        this._locked = false;
        if (result) result._internal.unmount();
        return result;
    }

    private push(origin: View[], ...next: View[]) {
        this._locked = true;
        const result = origin.push(...next);
        this._locked = false;
        next.forEach(item => item._internal.mount(this.parent));
        return result;
    }

    private shift(origin: View[]) {
        this._locked = true;
        const result = origin.shift();
        this._locked = false;
        if (result) result._internal.unmount();
        return result;
    }

    private unshift(origin: View[], ...next: View[]) {
        this._locked = true;
        const result = origin.unshift(...next);
        this._locked = false;
        next.forEach(item => item._internal.mount(this.parent));
        return result;
    }

    private splice(
        origin: View[],
        start: number,
        count: number,
        ...next: View[]
    ) {
        const prev = origin.slice(start, start + count);
        this._locked = true;
        const result = origin.splice(start, count, ...next);
        this._locked = false;
        prev.forEach(item => item._internal.unmount());
        next.forEach(item => item._internal.mount(this.parent));
        return result;
    }

    private fill(origin: View[]) {
        return origin
    }

    constructor(value: unknown, private readonly parent: View) {
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
                    if (prev instanceof View) prev._internal.unmount();
                    if (next instanceof View) next._internal.mount(this.parent);
                    return true;
                },
                deleteProperty: (origin, index) => {
                    const prev = Reflect.get(origin, index);
                    Reflect.deleteProperty(origin, index);
                    if (this._locked) return true;
                    if (prev instanceof View) prev._internal.unmount();
                    return true;
                }
            });
        } else this.value = value;
    }
}
