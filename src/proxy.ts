import { BaseEvent, EventProducer } from "./agent/event";
import { Model } from "./model";
import { DecorProducer } from "./agent/state";


export class Proxy<
    M extends Model = Model,
    E extends Model.Event = {},
    S extends Model.State = {},
    C extends Model.Child = {},
> {
    public readonly path?: string;

    public readonly target: M;

    public readonly child: Readonly<
        { [K in keyof C]: C[K] extends Model ? C[K]['proxy'] : unknown } & 
        { [K in keyof C]: C[K] extends Model[] ? C[K][number]['proxy'] : unknown }
    >

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
        this.decor = new DecorProducer(this.target, path)
    }

    private getEvent(origin: Record<string, EventProducer>, key: string): EventProducer | undefined {
        if (!origin[key]) {
            const path = this.path ? this.path + '/' + key : key;
            origin[key] = new EventProducer(this.target, path);
        }
        return origin[key];
    }

    private getChild(origin: Record<string, Proxy>, path: string): Proxy | undefined {
        const keys = path.split('/');
        const key = keys.shift();
        if (!key) return;

        if (!origin[key]) {
            const path = this.path ? this.path + '/' + key : key;
            origin[key] = new Proxy(this.target, path);
        }
        if (keys.length) {
            const child: Record<string, Proxy> = origin[key].child;
            const path = keys.join('/');
            return child[path];
        }
        return origin[key]
    }
}



