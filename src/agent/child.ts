import { Model } from "@/model";
import { Agent } from ".";
import { DebugService } from "@/service/debug";
import { ModelStatus } from "@/types/model";

export class ChildAgent<
    C1 extends Record<string, Model> = Record<string, Model>,
    C2 extends Model = Model,
    M extends Model = Model
> extends Agent<M> {
    
    public readonly draft: Readonly<C1 & C2[]>

    public get current(): Readonly<C1 & C2[]> {
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
            if (next instanceof Model) next.bind(this.target, key);
        }
        this.draft = new Proxy(origin, {
            get: this.get.bind(this),
            set: this.set.bind(this),
            deleteProperty: this.delete.bind(this),
        })
    }

    
    private check(value: unknown): unknown {
        if (value instanceof Model && value.status >= ModelStatus.BIND) return value.copy;
        return value;
    }

    public load() {
        for (const key of Object.keys(this.current)) {
            const child: Model | undefined = this.current[key];
            if (child instanceof Model) child.load();
        }
    }

    public unload() {
        for (const key of Object.keys(this.current)) {
            const child: Model | undefined = this.current[key];
            if (child instanceof Model) child.unload()
        }
    }

    public destroy() {
        for (const key of Object.keys(this.current)) {
            const child: Model | undefined = this.current[key];
            if (child instanceof Model) child.destroy();
        }
    }

    private get(origin: Record<string, Model>, key: string) {
        if (key === 'push') return this.push.bind(this, origin);
        if (key === 'pop') return this.pop.bind(this, origin);
        if (key === 'shift') return this.shift.bind(this, origin);
        if (key === 'unshift') return this.unshift.bind(this, origin);
        if (key === 'splice') return this.splice.bind(this, origin);
        if (key === 'fill') return this.fill.bind(this, origin); 
        const value = origin[key];
        return value;
    }

    @DebugService.log()
    private set(origin: Record<string, unknown>, key: string, next: unknown) {
        const prev = origin[key];
        if (prev instanceof Model) prev.unbind();

        origin[key] = next = this.check(next);
        if (next instanceof Model) next.bind(this.target, key);
        return true;
    }

    @DebugService.log()
    private delete(origin: Record<string, Model>, key: string) {
        const prev = origin[key];
        if (prev instanceof Model) prev.unbind();
        delete origin[key];
        return true;
    }

    @DebugService.log()
    private push(origin: C1 & C2[], ...next: C2[]) {
        const result = origin.push(...next);
        for (let index = 0; index < next.length; index += 1) {
            const item = this.check(next[index]);
            if (item instanceof Model) item.bind(this.target, index);
        }
        return result;
    }

    @DebugService.log()
    private pop(origin: C1 & C2[]) {
        const prev = origin[origin.length - 1];
        if (prev instanceof Model) prev.unbind();
        return origin.pop();
    }

    @DebugService.log()
    private shift(origin: C1 & C2[]) {
        const prev = origin[0];
        if (prev instanceof Model) prev.unbind();
        return origin.shift();
    }

    @DebugService.log()
    private unshift(origin: C1 & C2[], ...next: C2[]) {
        const result = origin.unshift(...next);
        for (let index = 0; index < next.length; index += 1) {
            const item = this.check(next[index]);
            if (item instanceof Model) item.bind(this.target, index);
        }
        return result;
    }


    @DebugService.log()
    private splice(origin: C1 & C2[], start: number, count: number, ...next: C2[]) {
        const prev: Array<Model | undefined> = origin.slice(start, start + count);
        for (let index = 0; index < prev.length; index += 1) {
            const item = prev[index];
            if (item instanceof Model) item.unbind();
        }

        const result = origin.splice(start, count, ...next);
        for (let index = 0; index < next.length; index += 1) {
            const item = this.check(next[index]);
            if (item instanceof Model) item.bind(this.target, index);
        }
        return result;
    }


    @DebugService.log()
    private fill(origin: C1 & C2[], sample: C2) {
        const length = origin.length;
        for (let index = 0; index < length; index += 1) {
            const prev = origin[index];
            if (prev instanceof Model) prev.unbind();
            const next = sample.copy;
            origin[index] = next;
            next.bind(this.target, index);
        }
    }

}