import { ModelEvent } from "../types/event";
import { Model } from "../model";
import { Value } from "../types";
import { EventProducer } from "@/agent/event";
import { DecorProducer } from "@/agent/state";
import { DebugService } from "@/service/debug";

export type ChildProxy<
    C1 extends Record<string, Model>,
    C2 extends Record<string, Model>
> = C1 extends C1 ? 
    { [K in keyof C1]: Model.Proxy<Required<C1>[K]> } & 
    { [K in keyof C2]: Model.Proxy<Required<C2>[K]> } : 
    never;


@DebugService.is(target => target.target.name)
export class ModelProxy<
    E extends Record<string, any> = Record<string, any>,
    S1 extends Record<string, Value> = Record<string, Value>,
    C1 extends Record<string, Model> = Record<string, Model>,
    C2 extends Record<string, Model> = Record<string, Model>,
    M extends Model = Model,
> {
    public readonly child: Readonly<ChildProxy<C1, C2>>;
    
    public readonly event: Readonly<
        { [K in keyof E]: EventProducer<Required<E>[K], M> } &
        { [K in keyof ModelEvent<M>]: EventProducer<ModelEvent<M>[K], M> }
    >;
    
    public readonly decor: Readonly<
        { [K in keyof S1]: DecorProducer<Required<S1>[K], M> }
    >;

    
    public readonly path?: string;
    
    public readonly target: M;
    

    constructor(target: M, path?: string) {
        this.path = path;
        this.target = target;
        this.child = new Proxy({} as any, { get: this._getChild.bind(this) })
        this.event = new Proxy({} as any, { get: this._getEvent.bind(this) })
        this.decor = new Proxy({} as any, { get: this._getDecor.bind(this) })
    }


    private _getDecor(origin: Record<string, DecorProducer>, path: string) {
        const keys = path.split('/');
        const key = keys.shift();
        if (!key) return;

        if (keys.length) {
            const path = keys.join('/');
            const child: Record<string, DecorProducer> = this.child[key].decor;
            return child[path];
        } else {
            if (origin[key]) return origin[key];

            const path = this.path ? [this.path, key].join('/') : key; 
            origin[key] = new DecorProducer(this.target, path);
            return origin[key];
        }
    }


    private _getEvent(origin: Record<string, EventProducer>, path: string) {
        const keys = path.split('/');
        const key = keys.shift();
        if (!key) return;

        if (keys.length) {
            const path = keys.join('/');
            const child: Record<string, EventProducer> = this.child[key].event;
            return child[path];
        } else {
            if (origin[key]) return origin[key];

            const path = this.path ? [this.path, key].join('/') : key; 
            origin[key] = new EventProducer(this.target, path);
            return origin[key]
        }
    }


    private _getChild(origin: Record<string, ModelProxy>, key: string) {
        if (origin[key]) return origin[key];
        
        const path = this.path ? [this.path, key].join('/') : key; 
        origin[key] = new ModelProxy(this.target, path);
        return origin[key];
    }
}
