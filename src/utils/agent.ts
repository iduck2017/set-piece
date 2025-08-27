import { Event, Model } from "../model";
import { Constructor } from "../types";
import { EventProducer } from "./event";
import { DecorProducer } from "./state";

export class ProxyUtil<
    M extends Model = Model,
    E extends Model.Event = {},
    S extends Model.State = {},
    C extends Model.Child = {},
> {
    public readonly type?: Constructor<Model>;
    public readonly path?: string;

    public readonly model: M;

    public readonly decor: DecorProducer<S, M>
    public readonly child: Readonly<
        { [K in keyof C]: Required<C>[K] extends Model ? Required<C>[K]['proxy'] : unknown } & 
        { [K in keyof C]: Required<C>[K] extends Model[] ? Required<C>[K][number]['proxy'] : unknown }
    >
    public readonly event: Readonly<
        { [K in keyof E]: EventProducer<Required<E>[K], M> } &
        { [K in keyof Event<M>]: EventProducer<Event<M>[K], M> }
    >;
    
    constructor(model: M, path?: string, type?: Constructor<Model>) {
        this.type = type;
        this.path = path;
        this.model = model;
        this.event = new Proxy({} as any, { get: this.getEvent.bind(this) })
        this.child = new Proxy({} as any, { get: this.getChild.bind(this) })
        this.decor = { 
            path: path ? `${path}/decor` : 'decor', 
            model
        }
    }

    public get<T extends Model>(type: Constructor<T>): {
        event: T['proxy']['event'],
        decor: T['proxy']['decor']
    } {
        return new ProxyUtil(this.model, this.path, type);
    }

    private getEvent(origin: Record<string, EventProducer>, key: string) {
        if (!origin[key]) {
            const path = this.path ? `${this.path}/${key}` : key;
            origin[key] = { path, model: this.model };
        }
        return origin[key];
    }

    private getChild(origin: Record<string, ProxyUtil>, path: string): ProxyUtil | undefined {
        const keys = path.split('/');
        const key = keys.shift();
        if (!key) return this;
        if (!origin[key]) {
            const path = this.path ? `${this.path}/${key}` : key;
            origin[key] = new ProxyUtil(this.model, path);
        }
        if (keys.length) {
            const child: Record<string, ProxyUtil> = origin[key].child;
            const path = keys.join('/');
            return child[path];
        }
        return origin[key]
    }
}



