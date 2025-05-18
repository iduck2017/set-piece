import { Model } from "@/model";
import { Agent } from ".";
import { DebugService } from "@/service/debug";
import { ModelStatus } from "@/utils/cycle";
import { TranxService } from "@/service/tranx";

@DebugService.is(target => target.target.name)
export class ChildAgent<
    C1 extends Record<string, Model> = Record<string, Model>,
    C2 extends Model = Model,
    M extends Model = Model
> extends Agent<M> {
    
    public readonly draft: C1 & C2[]

    public get current(): Readonly<C1 & Readonly<C2[]>> {
        const result: any = [];
        for (const key of Object.keys(this.draft)) {
            result[key] = this.draft[key];
        }
        return result;
    }
    
    constructor(
        target: M, 
        props: C1 & Record<number, C2>
    ) {
        super(target);

        const origin: any = [];
        for (const key of Object.keys(props)) {
            const next = origin[key] = this.check(props[key]);
            if (next instanceof Model) next._cycle.bind(this.target, key);
        }
        this.draft = new Proxy(origin, {
            get: this.get.bind(this),
            set: this.set.bind(this),
            deleteProperty: this.delete.bind(this),
        })
    }

    private check<T>(value: T): T {
        if (
            value instanceof Model && 
            value._cycle.status >= ModelStatus.BIND
        ) return value.copy;
        return value;
    }

    public load() {
        for (const key of Object.keys(this.current)) {
            const child: Model | undefined = this.current[key];
            if (child instanceof Model) child._cycle.load();
        }
    }

    public unload() {
        for (const key of Object.keys(this.current)) {
            const child: Model | undefined = this.current[key];
            if (child instanceof Model) child._cycle.unload()
        }
    }

    public uninit() {
        for (const key of Object.keys(this.current)) {
            const child: Model | undefined = this.current[key];
            if (child instanceof Model) child._cycle.uninit();
        }
    }

    private get(origin: Record<string, Model>, key: string) {
        if (key === 'push') return this.push.bind(this, origin);
        if (key === 'pop') return this.pop.bind(this, origin);
        if (key === 'shift') return this.shift.bind(this, origin);
        if (key === 'unshift') return this.unshift.bind(this, origin);
        if (key === 'splice') return this.splice.bind(this, origin);
        if (key === 'fill') return this.fill.bind(this, origin); 
        if (key === 'reverse') return this.reverse.bind(this, origin);
        if (key === 'sort') return this.sort.bind(this, origin);
        const value = origin[key];
        return value;
    }

    @DebugService.log()
    @TranxService.span()
    private set(origin: Record<string, unknown>, key: string, next: unknown) {
        const prev = origin[key];
        if (prev instanceof Model) {
            console.log('unbind', prev)
            prev._cycle.unbind();
        }
        origin[key] = next = this.check(next);
        if (next instanceof Model) {
            console.log('bind', next)
            next._cycle.bind(this.target, key);
        }
        return true;
    }

    @TranxService.span()
    private delete(origin: Record<string, Model>, key: string) {
        const prev = origin[key];
        if (prev instanceof Model) prev._cycle.unbind();
        delete origin[key];
        return true;
    }

    @DebugService.log()
    @TranxService.span()
    private push(origin: C1 & C2[], ...value: C2[]) {
        const next = [ ...value ]
        for (let index = 0; index < next.length; index += 1) {
            next[index] = this.check(next[index]);
        }
        const result = origin.push(...next);
        for (let index = 0; index < next.length; index += 1) {
            const item = next[index];
            if (item instanceof Model) {
                item._cycle.bind(this.target, index)
            }
        }
        return result;
    }

    @TranxService.span()
    @DebugService.log()
    private pop(origin: C1 & C2[]) {
        const prev = origin[origin.length - 1];
        if (prev instanceof Model) prev._cycle.unbind();
        return origin.pop();
    }

    @TranxService.span()
    private shift(origin: C1 & C2[]) {
        const prev = origin[0];
        if (prev instanceof Model) prev._cycle.unbind();
        return origin.shift();
    }

    @TranxService.span()
    private unshift(origin: C1 & C2[], ...value: C2[]) {
        const next = [ ...value ]
        for (let index = 0; index < next.length; index += 1) {
            next[index] = this.check(next[index]);
        }
        const result = origin.unshift(...next);
        for (let index = 0; index < next.length; index += 1) {
            const item = next[index];
            if (item instanceof Model) {
                item._cycle.bind(this.target, index);
            }
        }
        return result;
    }

    @TranxService.span()
    private splice(origin: C1 & C2[], start: number, count: number, ...value: C2[]) {
        const prev: Array<Model | undefined> = origin.slice(start, start + count);
        for (let index = 0; index < prev.length; index += 1) {
            const item = prev[index];
            if (item instanceof Model) item._cycle.unbind();
        }
        const next = [ ...value ]
        for (let index = 0; index < next.length; index += 1) {
            next[index] = this.check(next[index]);
        }
        const result = origin.splice(start, count, ...next);
        for (let index = 0; index < next.length; index += 1) {
            const item = next[index];
            if (item instanceof Model) {
                item._cycle.bind(this.target, index);
            }
        }
        return result;
    }

    @TranxService.span()
    private fill(origin: C1 & C2[], sample: C2) {
        const length = origin.length;
        for (let index = 0; index < length; index += 1) {
            const prev = origin[index];
            if (prev instanceof Model) prev._cycle.unbind();
            const next = sample.copy;
            origin[index] = next;
            next._cycle.bind(this.target, index);
        }
    }

    @TranxService.span()
    private reverse(origin: C1 & C2[]) {
        return origin.reverse();
    }

    @TranxService.span()
    private sort(origin: C1 & C2[], handler: (a: C2, b: C2) => number) {
        return origin.sort(handler);
    }

}