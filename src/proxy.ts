import { BaseEvent, EventProducer } from "./agent/event";
import { Model } from "./model";
import { DecorProducer } from "./agent/state";


export class Proxy<
    M extends Model = Model,
    E extends Model.E = {},
    S extends Model.S = {},
    C extends Model.C = {},
> {
    public readonly path?: string;

    public readonly target: M;

    public readonly child: Readonly<
        { [K in keyof C]: C[K] extends Model ? C[K]['proxy'] : unknown } & 
        { [K in keyof C]: C[K] extends Model[] ? C[K][number]['proxy'] : unknown }
    >

    /** @internal */
    public readonly state: Record<string, DecorProducer>

    public readonly decor: DecorProducer<S, M>

    public readonly event: Readonly<
        { [K in keyof E]: EventProducer<Required<E>[K], M> } &
        { [K in keyof BaseEvent<M>]: EventProducer<BaseEvent<M>[K], M> }
    >;
    
    constructor(target: M, path?: string) {
        this.path = path;
        this.target = target;
        const origin: any = {}
        this.event = new globalThis.Proxy({ ...origin }, { get: this.getEvent.bind(this) })
        this.child = new globalThis.Proxy({ ...origin }, { get: this.getChild.bind(this) })
        this.state = new globalThis.Proxy({ ...origin }, { get: this.getDecor.bind(this) })
        this.decor = new DecorProducer(this.target, path)
    }
  
    private getDecor(origin: Record<string, DecorProducer>, path: string): DecorProducer | undefined {
        const keys = path.split('/');
        const key = keys.shift();
        if (!key) return;
        if (keys.length) {
            const path = keys.join('/');
            const child: any = this.child[key];
            return child.state[path]
        }
        return this.decor;
    }

    private getEvent(origin: Record<string, EventProducer>, path: string): EventProducer | undefined {
        const keys = path.split('/');
        const key = keys.shift();
        if (!key) return;
        if (keys.length) {
            const path = keys.join('/');
            const child: any = this.child[key];
            return child.event[path]
        }
        if (!origin[key]) {
            const path = this.path ? this.path + '/' + key : key;
            origin[key] = new EventProducer(this.target, path);
        }
        return origin[key];
    }

    private getChild(origin: Record<string, Proxy>, key: string): Proxy {
        if (!origin[key]) {
            const path = this.path ? this.path + '/' + key : key;
            origin[key] = new Proxy(this.target, path);
        }
        return origin[key];
    }
}



