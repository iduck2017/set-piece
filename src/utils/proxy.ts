import { Model } from "../model";
import { IType } from "../types";
import { DecorProducer } from "../types/decor";
import { EventProducer } from "../types/event";
import { Format, Props } from "../types/model";

export class ProxyUtil<
    M extends Model = Model,
    E extends Props.E = {},
    S extends Props.S = {},
    C extends Props.C = {},
> {
    public readonly type?: IType<Model>;
    public readonly path?: string;

    public readonly model: M;

    public readonly decor: DecorProducer<S, M>
    public readonly child: Readonly<
        { [K in keyof C]: Required<C>[K] extends Model ? Required<C>[K]['proxy'] : unknown } & 
        { [K in keyof C]: Required<C>[K] extends Model[] ? Required<C>[K][number]['proxy'] : unknown }
    >
    public readonly event: Readonly<{ [K in keyof Format.E<E, M>]: EventProducer<Format.E<E, M>[K], M> }>;
    
    constructor(model: M, path?: string, type?: IType<Model>) {
        this.type = type;
        this.path = path;
        this.model = model;
        this.event = new Proxy({} as any, { get: this.getEvent.bind(this) })
        this.child = new Proxy({} as any, { get: this.getChild.bind(this) })
        this.decor = { 
            path,
            type,
            model
        }
    }

    public all<T extends Model>(type: IType<T>): {
        event: T['proxy']['event'],
        decor: T['proxy']['decor']
    } {
        return new ProxyUtil(this.model, this.path, type);
    }

    private getEvent(origin: Record<string, EventProducer>, key: string) {
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



