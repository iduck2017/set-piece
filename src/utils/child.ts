import { Util } from ".";
import { Model } from "../model";
import { Format, Props } from "../types/model";
import { TranxUtil } from "./tranx";

export class ChildUtil<
    M extends Model = Model,
    C extends Props.C = Props.C,
> extends Util<M> {

    public readonly origin: C;

    private _current: Format.Child<C>;
    public get current() { return this.copy(this._current) }

    constructor(model: M, props: C) {
        super(model);
        const origin: any = {};
        Object.keys(props).forEach(key => {
            if (props[key] instanceof Array) {
                origin[key] = props[key].map(item => {
                    item.utils.route.bind(this.model, key);
                    return item;
                })
            }
            if (props[key] instanceof Model) {
                let item = props[key];
                item.utils.route.bind(this.model, key);
                origin[key] = item;
            }
        });
        this.origin = new Proxy(origin, {
            get: this.get.bind(this),
            set: this.set.bind(this),
            deleteProperty: this.del.bind(this),
        })
        this._current = this.copy(origin);
    }

    public update() {
        this._current = this.copy(this.origin);
    }

    public copy(origin: Format.Child<C>): Format.Child<C> { 
        const result: any = {};
        Object.keys(origin).forEach(key => {
            const value = origin[key];
            if (value instanceof Array) result[key] = [...value];
            if (value instanceof Model) result[key] = value;
        })
        return result;
    }

    private get(origin: Partial<Record<string, Model | Model[]>>, key: string) {
        const value = origin[key];
        if (value instanceof Array) return this.proxy(value, key);
        return value;
    }
   
    @TranxUtil.span()
    private set(
        origin: Partial<Record<string, Model | Model[]>>, 
        key: string, 
        next?: Model | Model[]
    ) {
        const prev = origin[key];
        if (prev instanceof Array) prev.forEach(item => item.utils.route.unbind())
        if (prev instanceof Model) prev.utils.route.unbind();
        if (next instanceof Array) next.forEach(item => item.utils.route.bind(this.model, key));
        if (next instanceof Model) next.utils.route.bind(this.model, key);
        origin[key] = next;
        return true;
    }

    @TranxUtil.span()
    private del(origin: Partial<Record<string, Model | Model[]>>, key: string) {
        const prev = origin[key];
        if (prev instanceof Array) prev.forEach(item => item.utils.route.unbind())
        if (prev instanceof Model) prev.utils.route.unbind();
        delete origin[key];
        return true;
    }

    private proxy(origin: Model[], key: string): Model[] {
        return new Proxy(origin, {
            get: this.lget.bind(this, key),
            set: this.lset.bind(this, key),
            deleteProperty: this.ldel.bind(this, key),
        })
    }

    private lget(key: string,origin: any, index: string) {
        if (index === 'pop') return this.pop.bind(this, key, origin);
        if (index === 'sort') return this.sort.bind(this, origin);
        if (index === 'push') return this.push.bind(this, key, origin);
        if (index === 'fill') return this.fill.bind(this, key, origin);
        if (index === 'shift') return this.shift.bind(this, key, origin);
        if (index === 'splice') return this.splice.bind(this, key, origin);
        if (index === 'unshift') return this.unshift.bind(this, key, origin);
        if (index === 'reverse') return this.reverse.bind(this, origin);
        return origin[index];
    }

    @TranxUtil.span()
    private lset(key: string, origin: Record<string, unknown>, index: string, next: Model) {
        const prev = origin[index];
        if (prev instanceof Model) prev.utils.route.unbind();
        if (next instanceof Model) next.utils.route.bind(this.model, key);
        origin[index] = next;
        return true;
    }

    @TranxUtil.span()
    private ldel(key: string, origin: any, index: string) {
        const prev = origin[index];
        if (prev instanceof Model) prev.utils.route.unbind();
        delete origin[index];
        return true;
    }


    @TranxUtil.span()
    private push(key: string, origin: Model[], ...next: Model[]) {
        next.forEach(item => item.utils.route.bind(this.model, key));
        return origin.push(...next);
    }

    @TranxUtil.span()
    private unshift(key: string, origin: Model[], ...next: Model[]) {
        next.forEach(item => item.utils.route.bind(this.model, key));
        return origin.unshift(...next);
    }


    @TranxUtil.span()
    private pop(key: string, origin: Model[]) {
        const result = origin.pop();
        if (result) result.utils.route.unbind();
        return result;
    }

    @TranxUtil.span()
    private shift(key: string, origin: Model[]) {
        const result = origin.shift();
        if (result) result.utils.route.unbind();
        return result;
    }

    @TranxUtil.span()
    private reverse(origin: Model[]) {
        return origin.reverse();
    }

    @TranxUtil.span()
    private sort(origin: Model[], handler: (a: Model, b: Model) => number) {
        return origin.sort(handler);
    }

    @TranxUtil.span()
    private fill(key: string, origin: Model[], sample: Model, start?: number, end?: number) {
        if (!start) start = 0;
        if (!end) end = origin.length;
        const prev = origin.slice(start, end);
        prev.forEach(item => item.utils.route.unbind())
        const next = new Array(end - start).fill(sample);
        origin.splice(start, end - start, ...next);
        return origin;
    }

    @TranxUtil.span()
    private splice(key: string, origin: Model[], start: number, count: number, ...next: Model[]) {
        const prev = origin.slice(start, start + count);
        prev.forEach(item => item.utils.route.unbind())
        next.forEach(item => item.utils.route.bind(this.model, key));
        return origin.splice(start, count, ...next);
    }
}