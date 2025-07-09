import { TranxService } from "../service/tranx";
import { Model } from "../model";
import { Agent } from "./agent";
import { Refer } from "../types";
import { DebugService, LogLevel } from "../service/debug";

@DebugService.is(self => `${self.model.name}::refer`)
export class ReferAgent<
    M extends Model = Model,
    R extends Model.Refer = Model.Refer,
> extends Agent<M> {

    public readonly draft: { [K in keyof R]: R[K] extends any[] ? R[K] : R[K] | undefined }

    public get current(): Readonly<Refer<R>> { return { ...this.draft }; }

    private readonly router: Map<Model, string[]>;
    
    constructor(model: M, props: R) {
        super(model);
        this.router = new Map();
        Object.keys(props).forEach(key => {
            if (props[key] instanceof Array) props[key].forEach(item => item.agent.refer.bind(this.model, key));
            if (props[key] instanceof Model) props[key].agent.refer.bind(this.model, key);
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

    @DebugService.log(LogLevel.DEBUG)
    public unload() {
        const draft: Partial<Record<string, Model | Model[]>> = this.draft
        Object.keys(draft).forEach(key => {
            if (draft[key] instanceof Array) {
                draft[key] = draft[key].filter(item => {
                    if (item.agent.route.root === this.agent.route.root) return true;
                    item.agent.refer.unbind(this.model, key);
                    return false;
                })
            }
            if (draft[key] instanceof Model) {
                if (draft[key].agent.route.root === this.agent.route.root) return;
                draft[key].agent.refer.unbind(this.model, key);
                delete draft[key]
            }
        })
        this.router.forEach((keys, item) => {
            if (item.agent.route.root === this.agent.route.root) return;
            [...keys].forEach(key => {
                const origin: Record<string, Model | Model[]> = item.agent.refer.draft;
                if (origin[key] instanceof Array) {
                    const index = origin[key].indexOf(this.model);
                    if (index !== -1) origin[key].splice(index, 1);
                }
                if (origin[key] === this.model) delete origin[key];
            });
        });
        this.router.clear();
    }


    public debug(): Model[] {
        const dependency: Model[] = [];
        this.router.forEach((item, key) => dependency.push(key));
        Object.values(this.draft).forEach(item => {
            if (item instanceof Array) dependency.push(...item);
            if (item instanceof Model) dependency.push(item);
        });
        return dependency;
    }

    private get(origin: Partial<R>, key: string) {
        const value = origin[key];
        if (value instanceof Array) return this.proxy(value, key);
        return value;
    }

    @TranxService.span()
    public reset() {}

    @TranxService.span()
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

    @TranxService.span()
    private del(origin: Partial<Record<string, Model | Model[]>>, key: string) {
        let prev = origin[key];
        if (prev instanceof Array) prev.forEach(prev => prev.agent.refer.unbind(this.model, key));
        if (prev instanceof Model) prev.agent.refer.unbind(this.model, key);
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

    @TranxService.span()
    private lset(key: string, origin: any, index: string, next: Model) {
        const prev = origin[index];
        if (prev instanceof Model) prev.agent.refer.unbind(this.model, key);
        if (next instanceof Model) next.agent.refer.bind(this.model, key);
        origin[index] = next;
        return true;
    }
    
    @TranxService.span()
    private ldel(key: string, origin: any, index: string) {
        const prev = origin[index];
        if (prev instanceof Model) prev.agent.refer.unbind(this.model, key);
        delete origin[index];
        return true;
    }

    @TranxService.span()
    private push(key: string, origin: Model[], ...next: Model[]) {
        next.forEach(next => next.agent.refer.bind(this.model, key))
        return origin.push(...next);
    }

    @TranxService.span()
    private unshift(key: string, origin: Model[], ...next: Model[]) {
        next.forEach(next => next.agent.refer.bind(this.model, key));
        return origin.unshift(...next);
    }

    @TranxService.span()
    private pop(key: string, origin: Model[]) {
        const result = origin.pop();
        if (result) result.agent.refer.unbind(this.model, key);
        return result;
    }

    @TranxService.span()
    private shift(key: string, origin: Model[]) {
        const result = origin.shift();
        if (result) result.agent.refer.unbind(this.model, key);
        return result;
    }

    @TranxService.span()
    private reverse(origin: Model[]) {
        return origin.reverse();
    }

    @TranxService.span()
    private sort(origin: Model[], handler: (a: Model, b: Model) => number) {
        return origin.sort(handler);
    }

    @TranxService.span()
    private fill(key: string, origin: Model[], value: Model, start?: number, end?: number) {
        if (start === undefined) start = 0;
        if (end === undefined) end = origin.length;
        const prev = origin.slice(start, end);
        const next = new Array(end - start).fill(value);
        prev.forEach(prev => prev.agent.refer.unbind(this.model, key));
        next.forEach(next => next.agent.refer.bind(this.model, key));
        return origin.fill(value, start, end)
    }

    @TranxService.span()
    private splice(key: string, origin: Model[], start: number, count: number, ...next: Model[]) {
        const prev = origin.slice(start, start + count);
        prev.forEach(prev => prev.agent.refer.unbind(this.model, key));
        next.forEach(next => next.agent.refer.bind(this.model, key))
        const result = origin.splice(start, count, ...next);
        return result;
    }

}