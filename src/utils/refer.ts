import { Model } from "../model";
import { Util } from ".";
import { TranxUtil } from "./tranx";
import { Refer } from "../types";

export class ReferUtil<M extends Model, R extends Model.R> extends Util<M> {

    private _origin: Refer<R>
    public get origin() { return this._origin }

    private _current: Refer<R>
    public get current() { 
        return this.copy(this._current) 
    }
    
    private readonly consumers: Model[];

    constructor(model: M, props: Refer<R>) {
        super(model);
        this.consumers = [];
        Object.keys(props).forEach(key => {
            const value = props[key]
            if (value instanceof Array) value.forEach(item => this.bind(item));
            if (value instanceof Model) this.bind(value);
        });
        const origin: any = { ...props };
        this._origin = new Proxy(origin, {
            get: this.get.bind(this),
            set: this.set.bind(this),
            deleteProperty: this.del.bind(this)
        });
        this._current = this.copy(this._origin);
    }


    public init(props: Refer<R>) {
        Object.keys(props).forEach(key => {
            const value = props[key]
            if (value instanceof Array) value.forEach(item => this.bind(item));
            if (value instanceof Model) this.bind(value);
        });
        const origin: any = { ...props };
        this._origin = new Proxy(origin, {
            get: this.get.bind(this),
            set: this.set.bind(this),
            deleteProperty: this.del.bind(this)
        });
        this._current = this.copy(this._origin);
    }
    
    public update() {
        this._current = this.copy(this._origin)
    }

    private bind(model: Model) {
        model.utils.refer.consumers.push(this.model);
        return true;
    }

    private unbind(model: Model) {
        const consumers = model.utils.refer.consumers;
        const index = consumers.indexOf(this.model);
        if (index === -1) return;
        consumers.splice(index, 1);
    }

    public reload() {
        const origin: Partial<Model.R> = this._origin
        Object.keys(origin).forEach(key => {
            const value = origin[key]
            if (value instanceof Array) {
                if (!value.length) return;
                origin[key] = value.filter(item => this.utils.route.compare(item))
            }
            if (value instanceof Model) {
                if (this.utils.route.compare(value)) return; 
                delete origin[key]
            }
        })
        this.consumers.forEach(item => {
            if (this.utils.route.compare(item)) return;
            const origin: Model.R = item.utils.refer._origin;
            Object.keys(origin).forEach(key => {
                const value = origin[key]
                if (value instanceof Array) origin[key] = value.filter(item => item !== this.model)
                if (value instanceof Model && value === this.model) delete origin[key]
            })
        });
    }


    public copy(origin: Refer<R>): Refer<R> { 
        const result: any = {};
        Object.keys(origin).forEach(key => {
            const value = origin[key];
            if (value instanceof Array) result[key] = [...value];
            if (value instanceof Model) result[key] = value;
        })
        return result;
    }


    // proxy operation
    private get(origin: Partial<R>, key: string) {
        const value = origin[key];
        if (value instanceof Array) return this.proxy(value, key);
        return value;
    }

    @TranxUtil.span()
    private set(
        origin: Partial<Model.R>, 
        key: string, 
        next?: Model | Model[]
    ) {
        let prev = origin[key];
        if (prev instanceof Array) prev.forEach(item => this.unbind(item));
        if (prev instanceof Model) this.unbind(prev);
        if (next instanceof Array) next.forEach(item => this.bind(item));
        if (next instanceof Model) this.bind(next);
        origin[key] = next;
        return true;
    }

    @TranxUtil.span()
    private del(origin: Partial<Model.R>, key: string) {
        let prev = origin[key];
        if (prev instanceof Array) prev.forEach(item => this.unbind(item));
        if (prev instanceof Model) this.unbind(prev);
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

    private lget(key: string, origin: any, index: string) {
        if (index === 'pop') return this.pop.bind(this, key, origin);
        if (index === 'fill') return this.fill.bind(this, key, origin);
        if (index === 'sort') return this.sort.bind(this, origin);
        if (index === 'push') return this.push.bind(this, key, origin);
        if (index === 'shift') return this.shift.bind(this, key, origin);
        if (index === 'unshift') return this.unshift.bind(this, key, origin);
        if (index === 'splice') return this.splice.bind(this, key, origin);
        if (index === 'reverse') return this.reverse.bind(this, origin);
        return origin[index];
    }

    @TranxUtil.span()
    private lset(key: string, origin: any, index: string, next: Model) {
        const prev = origin[index];
        if (prev instanceof Model) this.unbind(prev)
        if (next instanceof Model) this.bind(next)
        origin[index] = next;
        return true;
    }
    
    @TranxUtil.span()
    private ldel(key: string, origin: any, index: string) {
        const prev = origin[index];
        if (prev instanceof Model) this.unbind(prev)
        delete origin[index];
        return true;
    }

    @TranxUtil.span()
    private push(key: string, origin: Model[], ...next: Model[]) {
        next.forEach(next => this.bind(next))
        return origin.push(...next);
    }

    @TranxUtil.span()
    private unshift(key: string, origin: Model[], ...next: Model[]) {
        next.forEach(item => this.bind(item));
        return origin.unshift(...next);
    }

    @TranxUtil.span()
    private pop(key: string, origin: Model[]) {
        const result = origin.pop();
        if (result) this.unbind(result);
        return result;
    }

    @TranxUtil.span()
    private shift(key: string, origin: Model[]) {
        const result = origin.shift();
        if (result) this.unbind(result)
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
    private fill(
        key: string, 
        origin: Model[], 
        value: Model, 
        start?: number, 
        end?: number
    ) {
        if (start === undefined) start = 0;
        if (end === undefined) end = origin.length;
        const prev = origin.slice(start, end);
        const next: Model[] = new Array(end - start).fill(value);
        prev.forEach(item => this.unbind(item));
        next.forEach(item => this.bind(item));
        return origin.fill(value, start, end)
    }

    @TranxUtil.span()
    private splice(
        key: string, 
        origin: Model[], 
        start: number, 
        count: number, 
        ...next: Model[]
    ) {
        const prev = origin.slice(start, start + count);
        prev.forEach(item => this.unbind(item));
        next.forEach(item => this.bind(item))
        const result = origin.splice(start, count, ...next);
        return result;
    }
}
    