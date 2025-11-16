import { Model } from "../model";
import { Frame } from "../types/model";
import { IClass } from "../types";
import { Computer } from "../types/decor";
import { Event, Producer } from "../types/event";

export class ProxyUtil<
    M extends Model = Model,
    E extends Model.E = {}, 
    S extends Model.S = {},
    C extends Model.C = {}
> { 
    public readonly keys: Array<string | IClass>;

    public readonly decor?: Computer<S, M>;
    
    public readonly event?: Readonly<
        { [K in keyof E]: Producer<E[K], M> } &
        { onChange: Producer<Event<Frame<M>>, M> }
    >

    public readonly child: Readonly<
        { [K in keyof C]: C[K] extends Model ? C[K]['proxy'] : unknown } &
        { [K in keyof C]: C[K] extends any[] ? C[K][number]['proxy'] : unknown }
    >

    public readonly model: Model;

    constructor(model: M, keys: Array<string | IClass>) {
        this.keys = keys;
        this.model = model;
        this.event = new Proxy({} as any, { get: this.getEvent.bind(this) })
        this.child = new Proxy({} as any, { get: this.getChild.bind(this) })
        this.decor = { keys, model }
    }

    public any<T extends Model>(type: IClass<T>): T['proxy'] {
        return new ProxyUtil(this.model, [...this.keys, type]);
    }
    
    private getEvent(origin: Record<string, Producer>, key: string): Producer {
        if (!origin[key]) {
            origin[key] = { 
                keys: this.keys, 
                name: key,
                model: this.model, 
            };
        }
        return origin[key];
    }

     private getChild(
        origin: Record<string, ProxyUtil>, 
        path: string
    ): ProxyUtil | undefined {
        const keys = path.split('/');
        const key = keys.shift();
        if (!key) return this;
        if (!origin[key]) {
            origin[key] = new ProxyUtil(this.model, [...this.keys, key]);
        }
        if (keys.length) {
            const child: Record<string, ProxyUtil> = origin[key].child;
            const path = keys.join('/');
            return child[path];
        }
        return origin[key]
    }
}
