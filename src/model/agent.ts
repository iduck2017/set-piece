import { DecorReceiver, DecorReceivers } from "./decor";
import { EventProducer, EventProducers } from "./event";
import { Model } from "./model";
import { Value } from "./types";

export type ChildAgent<
    C1 extends Record<string, Model>,
    C2 extends Model
> = C1 extends C1 ? 
    { [K in keyof C1]: Model.Agent<Required<C1>[K]> } & 
    { [0]: Model.Agent<C2> } : 
    never;

export class Agent<
    E extends Record<string, any>,
    S2 extends Record<string, Value>,
    C1 extends Record<string, Model>,
    C2 extends Model,
    M extends Model
> {
    readonly child: Readonly<ChildAgent<C1, C2>>;
    readonly event: Readonly<EventProducers<E, M>>;
    readonly decor: Readonly<DecorReceivers<S2, M>>;

    readonly self: M;
    readonly pathAbsolute: string | undefined;
    readonly pathRelative: string | undefined;

    constructor(self: M, path: string | undefined) {
        this.self = self;
        this.pathRelative = path;
        this.pathAbsolute = self.pathAbsolute ? `${self.pathAbsolute}/${path}` : path;
        this.child = new Proxy({} as ChildAgent<C1, C2>, { get: this.getAgent.bind(this) })
        this.event = new Proxy({} as EventProducers<E, M>, { get: this.getEvent.bind(this) })
        this.decor = new Proxy({} as DecorReceivers<S2, M>, { get: this.getDecor.bind(this) })
    }

    private getDecor(origin: DecorReceivers<S2, M>, key: string) {
        const value = Reflect.get(origin, key);
        if (value) return value;
        const receiver = new DecorReceiver(this.self, `${this.pathRelative}/${key}`);
        Reflect.set(origin, key, receiver);
        return receiver;
    }

    private getEvent(origin: EventProducers<E, M>, key: string) {
        const value = Reflect.get(origin, key);
        if (value) return value;
        const producer = new EventProducer(this.self, `${this.pathRelative}/${key}`);
        Reflect.set(origin, key, producer);
        return producer;
    }

    private getAgent(origin: ChildAgent<C1, C2>, key: string) {
        const value = Reflect.get(origin, key);
        if (value) return value;
        const agent = new Agent(this.self, `${this.pathRelative}/${key}`);
        Reflect.set(origin, key, agent);
        return agent;
    }
}
