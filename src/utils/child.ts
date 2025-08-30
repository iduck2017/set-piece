import { Util } from ".";
import { Model } from "../model";
import { Props } from "../types/model";
import { TranxUtil } from "./tranx";

export class ChildUtil<
    M extends Model = Model,
    C extends Props.C = Props.C,
> extends Util<M> {

    public readonly draft: C;

    public get current(): Readonly<Model.Child<C>> { 
        const result: any = {};
        Object.keys(this.draft).forEach(key => {
            const value = this.draft[key];
            if (value instanceof Array) result[key] = [...value];
            if (value instanceof Model) result[key] = value;
        })
        return result;
    }
    
    constructor(model: M, props: C) {
        super(model);
        const origin: any = {};
        Object.keys(props).forEach(key => {
            if (props[key] instanceof Array) {
                origin[key] = props[key].map(item => {
                    if (item.utils.route.isBind) item = item.copy();
                    item.utils.route.bind(this.model, key);
                    return item;
                })
            }
            if (props[key] instanceof Model) {
                let item = props[key];
                if (item.utils.route.isBind) item = item.copy();
                item.utils.route.bind(this.model, key);
                origin[key] = item;
            }
        });
        this.draft = new Proxy(origin, {
            get: this.get.bind(this),
            set: this.set.bind(this),
            deleteProperty: this.del.bind(this),
        })
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
        if (next instanceof Array) {
            next = next.map(next => {
                if (next.utils.route.isBind) next = next.copy();
                next.utils.route.bind(this.model, key);
                return next;
            });
        } 
        if (next instanceof Model) {
            if (next.utils.route.isBind) next = next.copy();
            next.utils.route.bind(this.model, key);
        }
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

    public reload() {
        Object.keys(this.draft).forEach(key => {
            if (this.draft[key] instanceof Array) this.draft[key].forEach(item => item.utils.route.reload())
            if (this.draft[key] instanceof Model) this.draft[key].utils.route.reload();
        })
        Object.keys(this.draft).forEach(key => {
            if (this.draft[key] instanceof Array) this.draft[key].forEach(item => item.utils.child.reload())
            if (this.draft[key] instanceof Model) this.draft[key].utils.child.reload();
        })
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
        if (next instanceof Model) {
            if (next.utils.route.isBind) next = next.copy();
            next.utils.route.bind(this.model, key);
        }
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
        next = next.map(next => {
            if (next.utils.route.isBind) next = next.copy();
            next.utils.route.bind(this.model, key);
            return next;
        });
        return origin.push(...next);
    }

    @TranxUtil.span()
    private unshift(key: string, origin: Model[], ...next: Model[]) {
        next = next.map(next => {
            if (next.utils.route.isBind) next = next.copy();
            next.utils.route.bind(this.model, key);
            return next;
        });
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
        const next = prev.map(() => {
            const next = sample.copy();
            next.utils.route.bind(this.model, key);
            return next;
        });
        origin.splice(start, end - start, ...next);
        return origin;
    }

    @TranxUtil.span()
    private splice(key: string, origin: Model[], start: number, count: number, ...next: Model[]) {
        const prev = origin.slice(start, start + count);
        prev.forEach(item => item.utils.route.unbind())
        next = next.map(item => {
            if (item.utils.route.isBind) item = item.copy();
            item.utils.route.bind(this.model, key);
            return item;
        });
        return origin.splice(start, count, ...next);
    }

}