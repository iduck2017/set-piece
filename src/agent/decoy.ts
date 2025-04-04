import { DecorReceiver, DecorReceivers } from "../types/decor";
import { EventProducers } from "../types/event";
import { Model } from "../model";
import { Value } from "../types";
import { EventProducer } from "@/agent/event";
import { Agent } from ".";

export type ChildDecoy<
    C1 extends Record<string, Model>,
    C2 extends Model
> = C1 extends C1 ? 
    { [K in keyof C1]: Model.Decoy<Required<C1>[K]> } & 
    { [0]: Model.Decoy<C2> } : 
    never;

export class DecoyAgent<
    E extends Record<string, any> = Record<string, any>,
    S2 extends Record<string, Value> = Record<string, Value>,
    C1 extends Record<string, Model> = Record<string, Model>,
    C2 extends Model = Model,
    M extends Model = Model
> extends Agent {
    readonly child: Readonly<ChildDecoy<C1, C2>>;
    readonly event: Readonly<EventProducers<E, M>>;
    readonly decor: Readonly<DecorReceivers<S2, M>>;

    readonly path?: string;
    readonly target: M;

    constructor(target: M, path?: string) {
        super(target);
        this.path = path;
        this.target = target;
        this.child = new Proxy({} as any, { get: this.getAgent.bind(this) })
        this.event = new Proxy({} as any, { get: this.getEvent.bind(this) })
        this.decor = new Proxy({} as any, { get: this.getDecor.bind(this) })
    }

    private getDecor(origin: DecorReceivers<S2, M>, path: string) {
        const keys = path.split('/');
        const key = keys.shift();
        if (!key) return;
        if (keys.length) {
            const path = keys.join('/');
            const child = this.child[key].decor;
            const value = Reflect.get(child, path);
            return value;
        } else {
            let value: EventProducer = Reflect.get(origin, key);
            if (value) return value;
            let path = key;
            if (this.path) path = this.path + '/' + key;
            value = new DecorReceiver(this.target, path);
            Reflect.set(origin, key, value);
            return value;
        }
    }

    private getEvent(origin: EventProducers<E, M>, path: string) {
        const keys = path.split('/');
        const key = keys.shift();
        path = keys.join('/');
        if (!key) return;
        if (keys.length) {
            const path = keys.join('/');
            const child = this.child[key].event;
            const value = Reflect.get(child, path);
            return value;
        } else {
            let value: EventProducer = Reflect.get(origin, key);
            if (value) return value;
            let path = key;
            if (this.path) path = this.path + '/' + key;
            value = new EventProducer(this.target, path);
            Reflect.set(origin, key, value);
            return value;
        }
    }

    private getAgent(origin: ChildDecoy<C1, C2>, key: string) {
        let value: DecoyAgent = Reflect.get(origin, key);
        if (value) return value;
        let path = key;
        if (this.path) path = this.path + '/' + key;
        value = new DecoyAgent(this.target, path);
        Reflect.set(origin, path, value);
        return value;
    }
}
