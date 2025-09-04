import { TranxUtil } from "./tranx";
import { Model } from "../model";
import { Util } from ".";
import { DebugUtil, LogLevel } from "./debug";
import { Props, Format } from "../types/model";

@DebugUtil.is(self => `${self.model.name}::refer`)
export class ReferUtil<
    M extends Model = Model,
    R extends Props.R = Props.R,
> extends Util<M> {

    private _origin: Format.Refer<R, true>
    public get origin(): Format.Refer<R, true> { return this._origin }

    private _current: Format.Refer<R>
    public get current() { return this.copy(this._current) }

    private readonly consumers: Model[];
    
    constructor(model: M, props: R) {
        super(model);
        this.consumers = [];
        Object.keys(props).forEach(key => {
            const value = props[key]
            if (value instanceof Array) value.forEach(item => this.link(item));
            if (value instanceof Model) this.link(value);
        });
        const origin: any = { ...props };
        this._origin = new Proxy(origin, {
            get: this.get.bind(this),
            set: this.set.bind(this),
            deleteProperty: this.del.bind(this)
        });
        this._current = this.copy(this._origin);
    }

    public copy(origin: Format.Refer<R>): Format.Refer<R> { 
        const result: any = {};
        Object.keys(origin).forEach(key => {
            const value = origin[key];
            if (value instanceof Array) result[key] = [...value];
            if (value instanceof Model) result[key] = value;
        })
        return result;
    }

    public init(props: Format.Refer<R>) {
        Object.keys(props).forEach(key => {
            const value = props[key]
            if (value instanceof Array) value.forEach(item => this.link(item));
            if (value instanceof Model) this.link(value);
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

    private link(model: Model) {
        model.utils.refer.consumers.push(this.model);
        return true;
    }

    private unlink(model: Model) {
        const consumers = model.utils.refer.consumers;
        const index = consumers.indexOf(this.model);
        if (index === -1) return;
        consumers.splice(index, 1);
    }

    @DebugUtil.log(LogLevel.DEBUG)
    public reload() {
        const origin: Partial<Props.R> = this._origin
        Object.keys(origin).forEach(key => {
            const value = origin[key]
            if (value instanceof Array) {
                if (!value.length) return;
                origin[key] = value.filter(item => this.utils.route.check(item))
            }
            if (value instanceof Model) {
                if (this.utils.route.check(value)) return; 
                delete origin[key]
            }
        })
        this.consumers.forEach(item => {
            if (this.utils.route.check(item)) return;
            const origin: Record<string, Model | Model[]> = item.utils.refer._origin;
            Object.keys(origin).forEach(key => {
                const value = origin[key]
                if (value instanceof Array) origin[key] = value.filter(item => item !== this.model)
                if (value instanceof Model && value === this.model) delete origin[key]
            })
        });
    }

    public debug() {
        const dependency: string[] = [];
        this.consumers.forEach(item => dependency.push(item.name));
        Object.values(this._origin).forEach(item => {
            if (item instanceof Array) dependency.push(...item.map(item => item.name));
            if (item instanceof Model) dependency.push(item.name);
        });
        console.log('🔍 dependency', dependency);
    }

    private get(origin: Partial<R>, key: string) {
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
        let prev = origin[key];
        if (prev instanceof Array) prev.forEach(item => this.unlink(item));
        if (prev instanceof Model) this.unlink(prev);
        if (next instanceof Array) next.forEach(item => this.link(item));
        if (next instanceof Model) this.link(next);
        origin[key] = next;
        return true;
    }

    @TranxUtil.span()
    private del(origin: Partial<Record<string, Model | Model[]>>, key: string) {
        let prev = origin[key];
        if (prev instanceof Array) prev.forEach(item => this.unlink(item));
        if (prev instanceof Model) this.unlink(prev);
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
        if (prev instanceof Model) this.unlink(prev)
        if (next instanceof Model) this.link(next)
        origin[index] = next;
        return true;
    }
    
    @TranxUtil.span()
    private ldel(key: string, origin: any, index: string) {
        const prev = origin[index];
        if (prev instanceof Model) this.unlink(prev)
        delete origin[index];
        return true;
    }

    @TranxUtil.span()
    private push(key: string, origin: Model[], ...next: Model[]) {
        next.forEach(next => this.link(next))
        return origin.push(...next);
    }

    @TranxUtil.span()
    private unshift(key: string, origin: Model[], ...next: Model[]) {
        next.forEach(item => this.link(item));
        return origin.unshift(...next);
    }

    @TranxUtil.span()
    private pop(key: string, origin: Model[]) {
        const result = origin.pop();
        if (result) this.unlink(result);
        return result;
    }

    @TranxUtil.span()
    private shift(key: string, origin: Model[]) {
        const result = origin.shift();
        if (result) this.unlink(result)
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
    private fill(key: string, origin: Model[], value: Model, start?: number, end?: number) {
        if (start === undefined) start = 0;
        if (end === undefined) end = origin.length;
        const prev = origin.slice(start, end);
        const next: Model[] = new Array(end - start).fill(value);
        prev.forEach(item => this.unlink(item));
        next.forEach(item => this.link(item));
        return origin.fill(value, start, end)
    }

    @TranxUtil.span()
    private splice(key: string, origin: Model[], start: number, count: number, ...next: Model[]) {
        const prev = origin.slice(start, start + count);
        prev.forEach(item => this.unlink(item));
        next.forEach(item => this.link(item))
        const result = origin.splice(start, count, ...next);
        return result;
    }
    
}