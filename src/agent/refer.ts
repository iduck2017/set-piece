import { TranxService } from "../service/tranx";
import { Model } from "../model";
import { Agent } from "./agent";
import { Refer } from "../types";

export class ReferAgent<
    M extends Model = Model,
    R extends Model.Refer = Model.Refer,
> extends Agent<M> {

    public readonly draft: Partial<R>

    public get current(): Readonly<Refer<R>> { return { ...this.draft }; }

    private readonly router: Map<Model, string[]>;
    
    constructor(model: M, props: R) {
        super(model);
        this.router = new Map();
        Object.keys(props).forEach(key => {
            let value = props[key];
            if (value instanceof Array) value.forEach(value => value.agent.route.bind(this.model, key));
            if (value instanceof Model) value.agent.route.bind(this.model, key);
        });
        const origin: any = { ...props };
        this.draft = new Proxy(origin, {
            get: this.get.bind(this),
            set: this.set.bind(this),
            deleteProperty: this.del.bind(this)
        });
    }

    private bind(value: Model, key: string) {
        const router = this.router.get(value) ?? [];
        router.push(key);
        this.router.set(value, router);
        return true;
    }

    private unbind(value: Model, key: string) {
        const router = this.router.get(value) ?? [];
        const index = router.indexOf(key);
        if (index === -1) return;
        router.splice(index, 1);
        this.router.set(value, router);
    }

    public unload() {
        const draft: Partial<Record<string, Model | Model[]>> = this.draft
        Object.keys(draft).forEach(key => {
            const value = draft[key];
            if (value instanceof Array) {
                draft[key] = value.filter(value => {
                    if (value.agent.route.root === this.agent.route.root) return true;
                    value.agent.refer.unbind(this.model, key);
                    return false;
                })
            }
            if (value instanceof Model) {
                if (value.agent.route.root === this.agent.route.root) return;
                value.agent.refer.unbind(this.model, key);
                delete draft[key]
            }
        })
        this.router.forEach((keys, that) => {
            if (that.agent.route.root === this.agent.route.root) return;
            [...keys].forEach(key => {
                const origin: Record<string, Model | Model[]> = that.agent.refer.draft;
                const value = origin[key];
                if (value instanceof Array) {
                    const index = value.indexOf(this.model);
                    if (index !== -1) value.splice(index, 1);
                }
                if (value === this.model) delete origin[key];
            });
        });
        this.router.clear();
    }


    public debug(): Model[] {
        const dependency: Model[] = [];
        this.router.forEach((value, key) => dependency.push(key));
        Object.values(this.draft).forEach(value => {
            if (value instanceof Array) dependency.push(...value);
            if (value instanceof Model) dependency.push(value);
        });
        return dependency;
    }

    private get(origin: Partial<R>, key: string) {
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
        let prev = origin[key];
        if (prev instanceof Array) prev.forEach(prev => prev.agent.refer.unbind(this.model, key));
        if (prev instanceof Model) prev.agent.refer.unbind(this.model, key);
        if (next instanceof Array) next.forEach(next => next.agent.refer.bind(this.model, key));
        if (next instanceof Model) next.agent.refer.bind(this.model, key);
        origin[key] = next;
        return true;
    }

    @TranxService.use()
    private del(origin: Partial<Record<string, Model | Model[]>>, key: string) {
        let prev = origin[key];
        if (prev instanceof Array) prev.forEach(prev => prev.agent.refer.unbind(this.model, key));
        if (prev instanceof Model) prev.agent.refer.unbind(this.model, key);
        delete origin[key];
        return true;
    }

    private proxy(value: Model[], key: string): Model[] {
        return new Proxy(value, {
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

    @TranxService.use()
    private lset(key: string, origin: any, index: string, next: Model) {
        const prev = origin[index];
        if (prev instanceof Model) prev.agent.refer.unbind(this.model, key);
        if (next instanceof Model) next.agent.refer.bind(this.model, key);
        origin[index] = next;
        return true;
    }
    
    @TranxService.use()
    private ldel(key: string, origin: any, index: string) {
        const prev = origin[index];
        if (prev instanceof Model) prev.agent.refer.unbind(this.model, key);
        delete origin[index];
        return true;
    }

    @TranxService.use()
    private push(key: string, origin: Model[], ...next: Model[]) {
        next.forEach(next => next.agent.refer.bind(this.model, key))
        return origin.push(...next);
    }

    @TranxService.use()
    private unshift(key: string, origin: Model[], ...next: Model[]) {
        next.forEach(next => next.agent.refer.bind(this.model, key));
        return origin.unshift(...next);
    }

    @TranxService.use()
    private pop(key: string, origin: Model[]) {
        const result = origin.pop();
        if (result) result.agent.refer.unbind(this.model, key);
        return result;
    }

    @TranxService.use()
    private shift(key: string, origin: Model[]) {
        const result = origin.shift();
        if (result) result.agent.refer.unbind(this.model, key);
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
    private fill(key: string, origin: Model[], value: Model, start?: number, end?: number) {
        if (start === undefined) start = 0;
        if (end === undefined) end = origin.length;
        const prev = origin.slice(start, end);
        const next = new Array(end - start).fill(value);
        prev.forEach(prev => prev.agent.refer.unbind(this.model, key));
        next.forEach(next => next.agent.refer.bind(this.model, key));
        return origin.fill(value, start, end)
    }

    @TranxService.use()
    private splice(key: string, origin: Model[], start: number, count: number, ...next: Model[]) {
        const prev = origin.slice(start, start + count);
        prev.forEach(prev => prev.agent.refer.unbind(this.model, key));
        next.forEach(next => next.agent.refer.bind(this.model, key))
        const result = origin.splice(start, count, ...next);
        return result;
    }

}