/* eslint-disable @typescript-eslint/no-unused-vars */

import { BaseData, BaseRecord } from "../types/base";
import { ModelStatus } from "../types/status";
import { modelStatus } from "../utils/status";
import { 
    BaseModel,
    ModelChunk, 
    ModelConfig, 
    ModelEvent
} from "../types/model";
import type { App } from "../app";
import { Exception } from "../utils/exceptions";
import { EventId, EventRegistry } from "../types/events";
import { ModelId } from "../types/registry";

export abstract class Model<
    M extends ModelId,
    E extends EventId,
    H extends EventId,
    R extends BaseData,
    I extends BaseData,
    S extends BaseData,
    P extends BaseModel | App
> {
    public readonly app: App;

    public readonly referId: string;
    public readonly modelId: M;

    private _status: ModelStatus;
    public get status() { return this._status; }

    private readonly _rule: R;
    private readonly _info: I;
    private readonly _state: S;

    private readonly _data: R & I & S;
    public get data() { return this._data; }

    private _parent?: P;
    public get parent() { return this._parent; }
    public get children(): BaseModel[] { return []; }

    private readonly _emitters: Partial<Record<E | ModelEvent, string[]>>;
    private readonly _handlers: Partial<Record<H | ModelEvent, string[]>>;

    protected _events: { [K in E | ModelEvent]: EventRegistry[K] }; 
    protected abstract _hooks: { [K in H | ModelEvent]: EventRegistry[K] }; 

    public constructor(
        config: ModelConfig<M, E, H, R, I, S>, 
        app: App
    ) {
        const wrapData = (raw: BaseRecord) => {
            return new Proxy(raw, {
                set: (target, key: string, value) => {
                    target[key] = value;
                    this.update(key);
                    return true;
                }
            });
        };

        this._status = ModelStatus.INITED;

        this.app = app;
        this.modelId = config.modelId;
        this.referId = config.referId || this.app.refer.register();
        
        this._rule = wrapData(config.rule);
        this._info = wrapData(config.info);
        this._state = wrapData(config.state);
        this._data = {
            ...config.rule,
            ...config.info,
            ...config.state
        };

        this._emitters = {
            ...config.emitters,
            [EventId.CHECK_BEFORE]: config.emitters[EventId.CHECK_BEFORE] || [],
            [EventId.UPDATE_DONE]: config.emitters[EventId.UPDATE_DONE] || []
        };
        this._handlers = config.handlers;

        this._events = new Proxy({}, {
            get: (target, key: any) => {
                return (data: any) => {
                    const event = key as H | ModelEvent;
                    const refers = this._handlers[event];
                    const handlers = this.app.refer.list(refers);
                    for (const handler of handlers) {
                        handler._hooks[event](data);
                    }
                };
            }
        }) as any;
    }

    protected _handleUpdateDone<
        R extends BaseData,
        I extends BaseData,
        S extends BaseData,
        K extends keyof (R & I & S)
    >(data: {
        target: Model<
            ModelId,
            never,
            never,
            R,
            I,
            S,
            BaseModel | App
        >,
        key: K,
        prev: (R & I & S)[K],
        next: (R & I & S)[K]
    }) {}

    protected _handleCheckBefore<
        R extends BaseData,
        I extends BaseData,
        S extends BaseData,
        K extends keyof (R & I & S)
    >(data: {
        target: Model<
            ModelId,
            never,
            never,
            R,
            I,
            S,
            BaseModel | App
        >,
        key: K,
        prev: (R & I & S)[K],
        next: (R & I & S)[K],
    }): (R & I & S)[K] { 
        return data.prev; 
    }

    
    @modelStatus(
        ModelStatus.MOUNTING,
        ModelStatus.MOUNTED
    )
    public update(key: keyof (R & I & S)) {
        const prev = this._data[key];
        const result = {
            ...this._rule,
            ...this._info,
            ...this._state
        }[key];
        const data = {
            target: this,
            key,
            prev: result,
            next: result
        };
        
        this._events[EventId.CHECK_BEFORE](data);
        this._data[key] = data.next;
        if (prev !== data.next) {
            this._events[EventId.UPDATE_DONE]({
                target: this,
                key,
                prev,
                next: data.next
            });
        }
    }

    @modelStatus(ModelStatus.INITED)
    public mount(parent: P) {
        this._status = ModelStatus.MOUNTING;
        this.app.refer.add(this);
        for (const child of this.children) child.mount(this);
        for (const key in this._rule) this.update(key); 
        for (const key in this._info) this.update(key); 
        for (const key in this._state) this.update(key); 
        this._parent = parent;
        this._status = ModelStatus.MOUNTED;
    }

    @modelStatus(ModelStatus.MOUNTED)
    public unmount() {
        this._status = ModelStatus.UNMOUNTING;
        for (const child of this.children) child.unmount();
        this.app.refer.remove(this);
        this._parent = undefined; 
        this._status = ModelStatus.UNMOUNTED; 
    }

    @modelStatus(ModelStatus.MOUNTED)
    protected _bind<
        H extends EventId
    >(
        that: Model<
            number,
            EventId,
            H,
            BaseData,
            BaseData,
            BaseData,
            BaseModel | App
        >,
        key: E & H
    ) {
        let emitters = this._emitters[key];
        let handlers = that._handlers[key];

        if (!emitters) emitters = this._emitters[key] = [];
        if (!handlers) handlers = that._handlers[key] = [];

        emitters.push(that.referId);
        handlers.push(this.referId);
    }

    @modelStatus(ModelStatus.UNMOUNTED)
    public _unemit<
        E extends EventId
    >(
        that: Model<
            number,
            E,
            never,
            BaseData,
            BaseData,
            BaseData,
            BaseModel | App
        >,
        key: E & H
    ) { 
        that._unbind(this, key);
    }

    @modelStatus(ModelStatus.UNMOUNTED)
    public _unbind<
        H extends EventId
    >(
        that: Model<
            number,
            never,
            H,
            BaseData,
            BaseData,
            BaseData,
            BaseModel | App
        >,
        key: E & H
    ) {
        const emitters = this._emitters[key];
        const handlers = that._handlers[key];
        
        if (!emitters || !handlers) throw new Exception();

        emitters.splice(emitters.indexOf(that.referId), 1);
        handlers.splice(handlers.indexOf(this.referId), 1);
    }

    @modelStatus(
        ModelStatus.INITED,
        ModelStatus.MOUNTED
    )
    public serialize(): ModelChunk<M, E, H, R, S> {
        return {
            modelId: this.modelId,
            referId: this.referId,
            rule: this._rule,
            state: this._state,
            emitters: this._emitters,
            handlers: this._handlers
        };
    }
}
