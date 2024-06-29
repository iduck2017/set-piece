/* eslint-disable @typescript-eslint/no-unused-vars */

import { BaseData, BaseRecord, VoidData } from "../types/base";
import { ModelStatus } from "../types/status";
import { modelStatus } from "../utils/status";
import { 
    BaseModel,
    ModelChunk, 
    ModelConfig 
} from "../types/model";
import type { App } from "../app";
import { Exception } from "../utils/exceptions";
import { ModelRefer } from "../types/common";

export abstract class Model<
    M extends number,
    R extends BaseData,
    I extends BaseData,
    S extends BaseData,
    E extends Record<string, BaseModel[]>,
    H extends Record<string, BaseModel[]>,
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

    private readonly _emitters: Record<keyof E, string[]>;
    private readonly _handlers: Record<keyof H, string[]>;

    public readonly emitters: E & ModelRefer;
    public readonly handlers: H & ModelRefer;

    public constructor(config: ModelConfig<M, R, I, S, E, H>) {
        const wrapData = (raw: BaseRecord) => {
            return new Proxy(raw, {
                set: (target, key: string, value) => {
                    target[key] = value;
                    this.update(key);
                    return true;
                }
            });
        };

        const wrapEvents = (raw: Record<string, string[]>) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return new Proxy<any>(raw, {
                get: (target, key: string): BaseModel[] => {
                    const value = target[key];
                    return this.app.refer.list(value);
                },
                set: () => false
            });
        };

        this._status = ModelStatus.INITED;

        this.app = config.app;
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

        this._emitters = config.emitters;
        this._handlers = config.handlers;
        
        this.emitters = wrapEvents(config.emitters);
        this.handlers = wrapEvents(config.handlers); 
    }

    protected _onUpdateDone<
        R extends BaseData,
        I extends BaseData,
        S extends BaseData,
        K extends keyof (R & I & S)
    >(
        target: Model<
            number,
            R,
            I,
            S,
            Record<string, BaseModel[]>,
            Record<string, BaseModel[]>,
            BaseModel | App
        >,
        key: K,
        prev: (R & I & S)[K],
        next: (R & I & S)[K]
    ) {}

    protected _onCheckBefore<
        R extends BaseData,
        I extends BaseData,
        S extends BaseData,
        K extends keyof (R & I & S)
    >(
        target: Model<
            number,
            R,
            I,
            S,
            Record<string, BaseModel[]>,
            Record<string, BaseModel[]>,
            BaseModel | App
        >,
        key: K,
        prev: (R & I & S)[K]
    ): (R & I & S)[K] { 
        return prev; 
    }
    
    @modelStatus(
        ModelStatus.MOUNTING,
        ModelStatus.MOUNTED
    )
    public update(key: keyof (R & I & S)) {
        const prev = this._data[key];
        let result = {
            ...this._rule,
            ...this._info,
            ...this._state
        }[key];

        const modifiers = this.handlers.checkBefore || [];
        for (const modifier of modifiers) {
            result = modifier._onCheckBefore(this, key, result);
        }
        
        this._data[key] = result;
        if (prev !== result) {
            const listeners = this.handlers.updateDone || [];
            for (const listener of listeners) {
                listener._onUpdateDone(this, key, prev, result);
            }
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
        H extends Record<string, BaseModel[]>
    >(
        that: Model<
            number,
            BaseData,
            BaseData,
            BaseData,
            Record<string, BaseModel[]>,
            H,
            BaseModel | App
        >,
        key: keyof E & keyof H
    ) {
        const emitters = this._emitters[key];
        const handlers = that._handlers[key];

        if (!emitters) this._emitters[key] = [];
        if (!handlers) that._handlers[key] = [];

        this._emitters[key].push(that.referId);
        that._handlers[key].push(this.referId);
    }

    @modelStatus(ModelStatus.UNMOUNTED)
    public _unconn<
        E extends Record<string, BaseModel[]>
    >(
        that: Model<
            number,
            BaseData,
            BaseData,
            BaseData,
            E,
            Record<string, BaseModel[]>,
            BaseModel | App
        >,
        key: keyof E & keyof H
    ) { 
        that._unbind(this, key);
    }

    @modelStatus(ModelStatus.UNMOUNTED)
    public _unbind<
        H extends Record<string, BaseModel[]>
    >(
        that: Model<
            number,
            BaseData,
            BaseData,
            BaseData,
            Record<string, BaseModel[]>,
            H,
            BaseModel | App
        >,
        key: keyof E & keyof H
    ) {
        const emitters = this._emitters[key];
        const handlers = that._handlers[key];
        
        if (!emitters || !handlers) throw new Exception();

        emitters.splice(emitters.indexOf(that.referId), 1);
        handlers.splice(handlers.indexOf(this.referId), 1);
    }

    public serialize(): ModelChunk<M, R, S, E, H> {
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
