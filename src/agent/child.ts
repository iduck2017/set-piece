import { Agent } from "./agent";
import { Model } from "../model";
import { TranxService } from "../service/tranx";
import { Child } from "../types";

export class ChildAgent<
    M extends Model = Model,
    C extends Model.Child = Model.Child,
> extends Agent<M> {

    public readonly draft: C;

    public get current(): Readonly<Child<C>> { return { ...this.draft }; }
    
    constructor(model: M, props: C) {
        super(model);
        const origin: any = {};
        Object.keys(props).forEach(key => {
            if (props[key] instanceof Array) {
                origin[key] = props[key].map(item => {
                    if (item.agent.route.isBind) item = item.copy();
                    item.agent.route.bind(this.model, key);
                    return item;
                })
            }
            if (props[key] instanceof Model) {
                let item = props[key];
                if (item.agent.route.isBind) item = item.copy();
                item.agent.route.bind(this.model, key);
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
   
    @TranxService.use()
    private set(
        origin: Partial<Record<string, Model | Model[]>>, 
        key: string, 
        next?: Model | Model[]
    ) {
        const prev = origin[key];
        if (prev instanceof Array) prev.forEach(prev => prev.agent.route.unbind())
        if (prev instanceof Model) prev.agent.route.unbind();
        if (next instanceof Array) {
            next = next.map(next => {
                if (next.agent.route.isBind) next = next.copy();
                next.agent.route.bind(this.model, key);
                return next;
            });
        } 
        if (next instanceof Model) {
            if (next.agent.route.isBind) next = next.copy();
            next.agent.route.bind(this.model, key);
        }
        origin[key] = next;
        return true;
    }

    @TranxService.use()
    private del(origin: Partial<Record<string, Model | Model[]>>, key: string) {
        const prev = origin[key];
        if (prev instanceof Array) prev.forEach(prev => prev.agent.route.unbind())
        if (prev instanceof Model) prev.agent.route.unbind();
        delete origin[key];
        return true;
    }

    public unload() {
        Object.keys(this.draft).forEach(key => {
            if (this.draft[key] instanceof Array) this.draft[key].forEach(item => item.agent.route.unload())
            if (this.draft[key] instanceof Model) this.draft[key].agent.route.unload();
        })
    }

    public load() {
        Object.keys(this.draft).forEach(key => {
            if (this.draft[key] instanceof Array) this.draft[key].forEach(item => item.agent.route.load())
            if (this.draft[key] instanceof Model) this.draft[key].agent.route.load();
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

    @TranxService.use()
    private lset(key: string, origin: Record<string, unknown>, index: string, next: Model) {
        const prev = origin[index];
        if (prev instanceof Model) prev.agent.route.unbind();
        if (next instanceof Model) {
            if (next.agent.route.isBind) next = next.copy();
            next.agent.route.bind(this.model, key);
        }
        origin[index] = next;
        return true;
    }

    @TranxService.use()
    private ldel(key: string, origin: any, index: string) {
        const prev = origin[index];
        if (prev instanceof Model) prev.agent.route.unbind();
        delete origin[index];
        return true;
    }


    @TranxService.use()
    private push(key: string, origin: Model[], ...next: Model[]) {
        next = next.map(next => {
            if (next.agent.route.isBind) next = next.copy();
            next.agent.route.bind(this.model, key);
            return next;
        });
        return origin.push(...next);
    }

    @TranxService.use()
    private unshift(key: string, origin: Model[], ...next: Model[]) {
        next = next.map(next => {
            if (next.agent.route.isBind) next = next.copy();
            next.agent.route.bind(this.model, key);
            return next;
        });
        return origin.unshift(...next);
    }


    @TranxService.use()
    private pop(key: string, origin: Model[]) {
        const result = origin.pop();
        if (result) result.agent.route.unbind();
        return result;
    }

    @TranxService.use()
    private shift(key: string, origin: Model[]) {
        const result = origin.shift();
        if (result) result.agent.route.unbind();
        return result;
    }

    @TranxService.use()
    private reverse(origin: Model[]) {
        return origin.reverse();
    }

    @TranxService.use()
    private sort(origin: Model[], handler: (a: Model, b: Model) => number) {
        return origin.sort(handler);
    }

    @TranxService.use()
    private fill(key: string, origin: Model[], sample: Model, start?: number, end?: number) {
        if (!start) start = 0;
        if (!end) end = origin.length;
        const prev = origin.slice(start, end);
        prev.forEach(prev => prev.agent.route.unbind())
        const next = prev.map(() => {
            const next = sample.copy();
            next.agent.route.bind(this.model, key);
            return next;
        });
        origin.splice(start, end - start, ...next);
        return origin;
    }

    @TranxService.use()
    private splice(key: string, origin: Model[], start: number, count: number, ...next: Model[]) {
        const prev = origin.slice(start, start + count);
        prev.forEach(prev => prev.agent.route.unbind())
        next = next.map(next => {
            if (next.agent.route.isBind) next = next.copy();
            next.agent.route.bind(this.model, key);
            return next;
        });
        return origin.splice(start, count, ...next);
    }

}