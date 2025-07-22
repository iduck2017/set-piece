import { TranxUtil } from "./tranx";
import { Model } from "../model";
import { Util } from ".";
import { Refer } from "../model";
import { DebugUtil, LogLevel } from "./debug";

@DebugUtil.is(self => `${self.model.name}::refer`)
export class ReferUtil<
    M extends Model = Model,
    R extends Model.Refer = Model.Refer,
> extends Util<M> {

    public readonly draft: { [K in keyof R]: R[K] extends any[] ? R[K] : R[K] | undefined }

    public get current(): Readonly<Refer<R>> { return { ...this.draft }; }

    private readonly router: Map<Model, string[]>;
    
    constructor(model: M, props: R) {
        super(model);
        this.router = new Map();
        Object.keys(props).forEach(key => {
            if (props[key] instanceof Array) props[key].forEach(item => item.utils.refer.bind(this.model, key));
            if (props[key] instanceof Model) props[key].utils.refer.bind(this.model, key);
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

    @DebugUtil.log(LogLevel.DEBUG)
    public unload() {
        const draft: Partial<Record<string, Model | Model[]>> = this.draft
        Object.keys(draft).forEach(key => {
            if (draft[key] instanceof Array) {
                draft[key] = draft[key].filter(item => {
                    if (item.utils.route.current.root === this.utils.route.current.root) return true;
                    item.utils.refer.unbind(this.model, key);
                    return false;
                })
            }
            if (draft[key] instanceof Model) {
                if (draft[key].utils.route.current.root === this.utils.route.current.root) return;
                draft[key].utils.refer.unbind(this.model, key);
                delete draft[key]
            }
        })
        this.router.forEach((keys, item) => {
            if (item.utils.route.current.root === this.utils.route.current.root) return;
            [...keys].forEach(key => {
                const origin: Record<string, Model | Model[]> = item.utils.refer.draft;
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

    @TranxUtil.span()
    public reset() {}

    @TranxUtil.span()
    private set(
        origin: Partial<Record<string, Model | Model[]>>, 
        key: string, 
        next?: Model | Model[]
    ) {
        let prev = origin[key];
        if (prev instanceof Array) prev.forEach(item => item.utils.refer.unbind(this.model, key));
        if (prev instanceof Model) prev.utils.refer.unbind(this.model, key);
        if (next instanceof Array) next.forEach(item => item.utils.refer.bind(this.model, key));
        if (next instanceof Model) next.utils.refer.bind(this.model, key);
        origin[key] = next;
        return true;
    }

    @TranxUtil.span()
    private del(origin: Partial<Record<string, Model | Model[]>>, key: string) {
        let prev = origin[key];
        if (prev instanceof Array) prev.forEach(item => item.utils.refer.unbind(this.model, key));
        if (prev instanceof Model) prev.utils.refer.unbind(this.model, key);
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
        if (prev instanceof Model) prev.utils.refer.unbind(this.model, key);
        if (next instanceof Model) next.utils.refer.bind(this.model, key);
        origin[index] = next;
        return true;
    }
    
    @TranxUtil.span()
    private ldel(key: string, origin: any, index: string) {
        const prev = origin[index];
        if (prev instanceof Model) prev.utils.refer.unbind(this.model, key);
        delete origin[index];
        return true;
    }

    @TranxUtil.span()
    private push(key: string, origin: Model[], ...next: Model[]) {
        next.forEach(next => next.utils.refer.bind(this.model, key))
        return origin.push(...next);
    }

    @TranxUtil.span()
    private unshift(key: string, origin: Model[], ...next: Model[]) {
        next.forEach(item => item.utils.refer.bind(this.model, key));
        return origin.unshift(...next);
    }

    @TranxUtil.span()
    private pop(key: string, origin: Model[]) {
        const result = origin.pop();
        if (result) result.utils.refer.unbind(this.model, key);
        return result;
    }

    @TranxUtil.span()
    private shift(key: string, origin: Model[]) {
        const result = origin.shift();
        if (result) result.utils.refer.unbind(this.model, key);
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
        prev.forEach(item => item.utils.refer.unbind(this.model, key));
        next.forEach(item => item.utils.refer.bind(this.model, key));
        return origin.fill(value, start, end)
    }

    @TranxUtil.span()
    private splice(key: string, origin: Model[], start: number, count: number, ...next: Model[]) {
        const prev = origin.slice(start, start + count);
        prev.forEach(item => item.utils.refer.unbind(this.model, key));
        next.forEach(item => item.utils.refer.bind(this.model, key))
        const result = origin.splice(start, count, ...next);
        return result;
    }

}