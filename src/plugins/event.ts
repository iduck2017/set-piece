import { StateUpdateEvent, Value } from "@/types"
import { BaseModel } from "."
import { ChildUpdateEvent } from "./refer"

export type EventProducer<E = any> = { key: string, target: BaseModel }
export type EventConsumer<E = any> = { handler: EventHandler<E>, target: BaseModel }
export type EventHandler<E = any> = (event: E) => void

export type ModelEvent<S extends Record<string, Value>, C> = {
    onStateUpdate: StateUpdateEvent<S>
    onChildUpdate: ChildUpdateEvent<C>
}

export type EventEmitters<E> = Readonly<{ [K in keyof E]: EventHandler<E[K]> }>
export type EventProducers<
    S extends Record<string, Value>,
    C extends Record<string, BaseModel> | BaseModel[],
    E extends Partial<ModelEvent<S, C>>
> = 
    Readonly<{ [K in keyof E]: EventProducer<E[K]> }> &
    Readonly<{ [K in keyof ModelEvent<S, C>]: ModelEvent<S, C>[K] }>


export class EventPlugin<
    S extends Record<string, Value>,
    C extends Record<string, BaseModel> | BaseModel[],
    E extends Partial<ModelEvent<S, C>>
> {
    readonly producers: EventProducers<S, C, E>
    readonly emitters: EventEmitters<E>
    
    private readonly _model: BaseModel;
    private readonly _consumers = new Map<EventHandler, EventConsumer>();
    private readonly _routers = new Map<EventProducer, EventConsumer[]>();
    private readonly _sources = new Map<EventConsumer, EventProducer[]>();

    constructor(model: BaseModel) {
        this._model = model;
        
        this.producers = new Proxy({} as EventProducers<S, C, E>, {
            deleteProperty: () => false,
            set: () => false,
            get: (target, key: string) => {
                const value = Reflect.get(target, key);
                if (value) return value;
                const event = { key, target: this._model };
                Reflect.set(target, key, event);
                return event;
            }
        })
        this.emitters = new Proxy({} as EventEmitters<E>, {
            deleteProperty: () => false,
            set: () => false,
            get: (target, key) => {
                const producer = Reflect.get(this.producers, key);
                return this._emitEvent.bind(this, producer);
            }
        })
    }

    private _emitEvent<E>(producer: EventProducer<E>, event: E) {
        const _consumers = this._routers.get(producer) || [];
        const consumers = [ ..._consumers ];

        consumers.sort((consumerA, consumerB) => {
            const stateA = consumerA.target.state;
            const stateB = consumerB.target.state;
            if (stateA.uuid > stateB.uuid) return 1;
            if (stateA.uuid < stateB.uuid) return -1;
            return 0;
        });
        consumers.forEach(consumer => {
            const { target, handler } = consumer;
            handler.call(target, event); 
        })
    }


    bindEvent<E>(
        producer: EventProducer<E>, 
        handler: EventHandler<E>,
    ) {
        const target = producer.target;
        
        const childA = target.refer;
        const childB = this._model.refer;

        if (childA.root !== childB.root) return;

        const that = target.event;
        let consumer = this._consumers.get(handler)
        if (!consumer) {
            consumer = { target: this._model, handler };
            this._consumers.set(handler, consumer);
        }
   
        const consumers = this._routers.get(producer) || [];
        consumers.push(consumer);
        that._routers.set(producer, consumers);

        const producers = this._sources.get(consumer) || [];
        producers.push(producer);
        this._sources.set(consumer, producers);
    }

    unbindEvent<E>(
        producer: EventProducer<E> | undefined,
        handler: EventHandler<E>,
    ) {
        const consumer = this._consumers.get(handler);
        if (!consumer) return;

        const producers = this._sources.get(consumer) || [];
        for (const _producer of [ ...producers ]) {
            if (producer && _producer !== producer) continue;

            const that = _producer.target.event;
            
            const consumers = that._routers.get(_producer) || [];
            while (consumers.includes(consumer)) {
                const index = consumers.indexOf(consumer);
                if (index === -1) continue;
                consumers.splice(index, 1);
            }
            that._routers.set(_producer, consumers);

            const index = producers.indexOf(_producer);
            if (index === -1) continue;
            producers.splice(index, 1);
        }
        this._sources.set(consumer, producers);
    }

}