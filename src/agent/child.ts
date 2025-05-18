import { Model } from "@/model";
import { Agent } from ".";
import { DebugService } from "@/service/debug";
import { TranxService } from "@/service/tranx";

export type ChildGroup<
    C1 extends Record<string, Model>,
    C2 extends Record<string, Model>
> = C1 &
    { [K in keyof C2]: Readonly<Required<C2>[K][]> }


@DebugService.is(target => target.target.name)
export class ChildAgent<
    C1 extends Record<string, Model> = Record<string, Model>,
    C2 extends Record<string, Model> = Record<string, Model>,
    M extends Model = Model
> extends Agent<M> {
    
    public readonly draft: ChildGroup<C1, C2>

    public get current(): Readonly<ChildGroup<C1, C2>> {
        const result: any = [];
        for (const key of Object.keys(this.draft)) {
            result[key] = this.draft[key];
        }
        return result;
    }
    
    constructor(
        target: M, 
        props: Readonly<ChildGroup<C1, C2>>
    ) {
        super(target);

        const origin: any = [];
        for (const key of Object.keys(props)) {
            const value = props[key];
            if (value instanceof Model) {  }
            const next = origin[key] = this.check(props[key]);
            if (next instanceof Model) next._cycle.bind(this.target, key);
        }
        this.draft = new Proxy(origin, {
            set: this.set.bind(this),
            deleteProperty: this.delete.bind(this),
        })
    }

    private check<T>(value: T): T {
        if (value instanceof Model && value._cycle.isBind) return value.copy;
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
}