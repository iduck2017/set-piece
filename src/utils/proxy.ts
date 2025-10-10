import { Frame, Model } from "../model";
import { IClass } from "../types";
import { Computer } from "../types/decor";
import { Producer } from "./event";

export class ProxyUtil<
    M extends Model = Model,
    E extends Model.E = {}, 
    S extends Model.S = {},
    C extends Model.C = {}
> { 
    public readonly type?: IClass<Model>;
    public readonly path?: string;

    public readonly decor?: Computer<S, M>;
    public readonly event?: Readonly<
        { [K in keyof E]: Producer<E[K], M> } &
        { onChange: Producer<{ prev: Frame<M> }, M> }
    >
    public readonly child: Readonly<
        { [K in keyof C]: C[K] extends Model ? C[K]['proxy'] : unknown } &
        { [K in keyof C]: C[K] extends any[] ? C[K][number]['proxy'] : unknown }
    >

    public readonly model: Model;

    constructor(model: M, path?: string, type?: IClass<Model>) {
        this.type = type;
        this.path = path;
        this.model = model;
        this.event = new Proxy({} as any, { get: this.getEvent.bind(this) })
        this.child = new Proxy({} as any, { get: this.getChild.bind(this) })
        this.decor = { 
            type,
            path,
            model
        }
    }

    // @todo
    public any<T extends Model>(type: IClass<T>): {
        event?: T['proxy']['event'],
        decor?: T['proxy']['decor']
    } {
        return new ProxyUtil(this.model, this.path, type);
    }

    
    private getEvent(origin: Record<string, Producer>, key: string) {
        if (!origin[key]) {
            origin[key] = { 
                type: this.type,
                path: this.path, 
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

// /x/y/Z/a/B/onChange
// /x/y/z/a/b/onChange