import { Value } from "@/types"
import { ChildUpdateEvent } from "./refer"
import { StateUpdateEvent } from "./state"
import { BaseModel } from "../model"
import { DebugService } from "@/services/debug"
import { ContextGetter, Plugin } from "."
import { CheckService } from "@/services/check"

/** 事件处理函数 */
export type EventHandler<E = any, M extends BaseModel = BaseModel> = (target: M, event: E) => void

/** 事件触发函数 */
export type EventEmitter<E = any> = (event: E) => void;

/** 
 * 事件生产者 
 * 模型只披露指针用于事件监听，而不提供具体的触发函数
*/
export type EventProducer<E = any> = { target: BaseModel, key: string }

/** 事件消费者 */
export type EventConsumer<E = any> = { target: BaseModel, handler: EventHandler<E> }

/** 事件触发器组 */
export type EventEmitters<E> = Readonly<{ [K in keyof E]: EventEmitter<E[K]> }>

/** 事件生产者组 */
export type EventProducers<
    S extends Record<string, Value>,
    C extends Record<string, BaseModel> | BaseModel[],
    E extends Partial<ModelEvent<S, C>>
> = 
    Readonly<{ [K in keyof E]: EventProducer<E[K]> }> &
    Readonly<{ [K in keyof ModelEvent<S, C>]: ModelEvent<S, C>[K] }>


/** 模型基本事件 */
export type ModelEvent<S extends Record<string, Value>, C> = {
    /** 状态变更事件 */
    onStateUpdate: StateUpdateEvent<S>
    /** 节点变更事件 */
    onChildUpdate: ChildUpdateEvent<C>
}

/** 事件系统 */
export class EventPlugin<
    S extends Record<string, Value>,
    C extends Record<string, BaseModel> | BaseModel[],
    E extends Partial<ModelEvent<S, C>>
> extends Plugin {

    /** 
     * 事件生产者组 
     * 对外披露
    */
    readonly producers: EventProducers<S, C, E>
    
    /** 事件触发器组 */
    readonly emitters: EventEmitters<E>
    
    /** 
     * 事件消费者组 
     * 从事件触发函数到事件消费者的映射关系
    */
    private readonly _consumers = new Map<EventHandler, EventConsumer>();

    /** 事件生产-消费关系 */
    private readonly _channels = new Map<EventProducer, EventConsumer[]>();
    
    /** 
     * 虚拟事件生产-消费关系 
     * 代表对任意时刻位于指定路径下节点事件的监听行为
    */
    private readonly _virtualChannels = new Map<string, EventConsumer[]>();
    
    /** 
     * 事件消费-生产关系
     * 便于事件注销时进行索引
     */
    private readonly _reverseChannels = new Map<EventConsumer, EventProducer[]>();

    constructor(
        self: BaseModel,
        getContext: ContextGetter
    ) {
        super(self, getContext);
        
        this.producers = new Proxy({} as EventProducers<S, C, E>, {
            get: this._getProducer.bind(this),
            set: () => true,
            deleteProperty: () => true,
        })
        this.emitters = new Proxy({} as EventEmitters<E>, {
            get: this._getEmitter.bind(this),
            set: () => true,
            deleteProperty: () => true,
        })
    }

    /**
     * 获取事件生产者，或初始化
     * @param origin 
     * @param key 事件名
     * @returns 
     */
    private _getProducer(origin: EventProducers<S, C, E>, key: string) {
        const producer = Reflect.get(origin, key);
        if (producer) return producer;

        const event = { key, target: this.self };
        Reflect.set(origin, key, event);
        return event;
    }

    /**
     * 获取事件出发函数
     * @param origin 
     * @param key 事件名
     * @returns 
     */
    private _getEmitter(origin: EventEmitters<E>, key: string) {
        const producer = Reflect.get(this.producers, key);
        return this._emitEvent.bind(this, producer)
    }

    /** @todo isLoad */
    /**
     * 触发事件
     * @param producer 
     * @param event 
     */
    @DebugService.useStack()
    private _emitEvent<E>(producer: EventProducer<E>, event: E) {
        const _consumers = this._channels.get(producer) || [];
        const consumers = [ ..._consumers ];

        /** @todo sort by uuid */
        // consumers.sort((consumerA, consumerB) => {
        //     const stateA = this.getContext(consumerA.target).state;
        //     const stateB = this.getContext(consumerB.target).state;
        //     if (stateA.uuid > stateB.uuid) return 1;
        //     if (stateA.uuid < stateB.uuid) return -1;
        //     return 0;
        // });
        for (const consumer of consumers) {
            const { target, handler } = consumer;
            handler.call(target, this.self, event);
        }
    }

    /** @todo isLoad */
    /**
     * 注册事件
     * @param producer 
     * @param handler 
     * @returns 
     */
    @DebugService.useStack()
    bindEvent<E>(
        producer: EventProducer<E>, 
        handler: EventHandler<E>,
    ) {
        const target = producer.target;
        
        /** @todo same root */
        // const referA = target.plugins.refer;
        // const referB = this.self.plugins.refer;

        // if (referA.root !== referB.root) return;

        const that = target.plugins.event;
        let consumer = this._consumers.get(handler)
        if (!consumer) {
            consumer = { target: this.self, handler };
            this._consumers.set(handler, consumer);
        }
   
        const consumers = this._channels.get(producer) || [];
        consumers.push(consumer);
        that._channels.set(producer, consumers);

        const producers = this._reverseChannels.get(consumer) || [];
        producers.push(producer);
        this._reverseChannels.set(consumer, producers);
    }

    @DebugService.useStack()
    unbindEvent<E>(
        producer: EventProducer<E> | undefined,
        handler: EventHandler<E>,
    ) {
        const consumer = this._consumers.get(handler);
        if (!consumer) return;

        const producers = this._reverseChannels.get(consumer) || [];
        for (const _producer of [ ...producers ]) {
            if (producer && _producer !== producer) continue;

            const that = _producer.target.plugins.event;
            const consumers = that._channels.get(_producer) || [];
            while (consumers.includes(consumer)) {
                const index = consumers.indexOf(consumer);
                if (index === -1) continue;
                consumers.splice(index, 1);
            }
            that._channels.set(_producer, consumers);

            const index = producers.indexOf(_producer);
            if (index === -1) continue;
            producers.splice(index, 1);
        }
        this._reverseChannels.set(consumer, producers);
    }

    // @DebugService.useMute()
    // useModel(setter: EventHandler<{ target: BaseModel }>) {
    //     this.bindEvent(this.producers.onChildUpdate, setter);
    //     this.bindEvent(this.producers.onStateUpdate, setter);

    //     return () => {
    //         this.unbindEvent(this.producers.onChildUpdate, setter);
    //         this.unbindEvent(this.producers.onStateUpdate, setter);
    //     }
    // }

}