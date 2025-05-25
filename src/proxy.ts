import { BaseEvent, EventProducer } from "./agent/event";
import { Model } from "./model";
import { DecorProducer } from "./agent/state";

export class Proxy<
    M extends Model = Model,
    E extends Record<string, any> = {},
    S1 extends Record<string, any> = {},
    C1 extends Record<string, Model> = {},
    C2 extends Record<string, Model> = {},
> {
    public readonly target: M;

    public readonly path?: string;

    public readonly child: Readonly<
        { [K in keyof C1]: Model.Proxy<Required<C1>[K]> } & 
        { [K in keyof C2]: Model.Proxy<Required<C2>[K]> }
    >;
    
    public readonly event: Readonly<
        { [K in keyof E]: EventProducer<Required<E>[K], M> } &
        { [K in keyof BaseEvent<M>]: EventProducer<BaseEvent<M>[K], M> }
    >;
    
    public readonly decor: Readonly<
        { [K in keyof S1]: DecorProducer<S1[K], M> }
    >

    constructor(target: M, path?: string) {
        this.target = target;
        this.path = path;
        this.event = new globalThis.Proxy({} as any, { get: this.eventGet.bind(this) })
        this.child = new globalThis.Proxy({} as any, { get: this.childGet.bind(this) })
        this.decor = new globalThis.Proxy({} as any, { get: this.decorGet.bind(this) })
    }

    private decorGet(origin: Record<string, DecorProducer>, path: string): DecorProducer | undefined {
        const keys = path.split('/');
        const key = keys.shift();
        if (!key) return;

        if (keys.length) {
            const path = keys.join('/');
            const decor: Record<string, DecorProducer> | undefined = this.child[key]?.decor;
            if (!decor) return;
            return decor[path]
        }
        
        if (!origin[key]) {
            const path = [this.path, key].filter(Boolean).join('/');
            origin[key] = new DecorProducer(this.target, path);
        }
        return origin[key];
    }


    private eventGet(origin: Record<string, EventProducer>, path: string): EventProducer | undefined {
        const keys = path.split('/');
        const key = keys.shift();
        if (!key) return;

        if (keys.length) {
            const path = keys.join('/');
            const event: Record<string, EventProducer> | undefined = this.child[key]?.event;
            if (!event) return;
            return event[path]
        }
        
        if (!origin[key]) {
            const path = [this.path, key].filter(Boolean).join('/');
            origin[key] = new EventProducer(this.target, path);
        }
        return origin[key];
    }

    private childGet(origin: Record<string, Proxy>, key: string): Proxy {
        if (!origin[key]) {
            const path = [this.path, key].filter(Boolean).join('/');
            origin[key] = new Proxy(this.target, path);
        }
        return origin[key];
    }
}



