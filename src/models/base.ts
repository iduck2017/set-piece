/* eslint-disable @typescript-eslint/no-unused-vars */

import { BaseRecord } from "../types/base";
import { ModelStatus } from "../types/status";
import { modelStatus } from "../utils/decors/status";
import { 
    ModelChunk, 
    ModelConfig, 
    ModelDefinition 
} from "../types/model";
import type { App } from "../app";
import { 
    CacheOF,
    ConsumersOF,
    DataOF,
    IDOF, 
    InfoOF, 
    ParentOF,
    ProvidersOF,
    ReferOF,
    RuleOF,
    StateOF
} from "../types/reflex";
import { ReferenceService } from "../services/reference";
import { Exception } from "../utils/exceptions";

export abstract class Model<
    T extends ModelDefinition = ModelDefinition
> {
    public readonly app: App;
    public readonly reference: ReferenceService;

    public readonly key: string;
    public readonly id: IDOF<T>;

    private _status: ModelStatus;
    public get status() { return this._status; }

    private readonly _rule: RuleOF<T>;
    private readonly _info: InfoOF<T>;
    private readonly _state: StateOF<T>;

    private readonly _data: CacheOF<T>;
    public readonly data: DataOF<T>;

    private _parent?: ParentOF<T>;
    public get parent() { return this._parent; }
    public get children(): Model[] { return []; }

    private readonly _providers: ReferOF<ProvidersOF<T>>;
    private readonly _consumers: ReferOF<ConsumersOF<T>>;

    public providers: ProvidersOF<T>;
    public consumers: ProvidersOF<T>;

    public constructor(config: ModelConfig<T>) {
        const that = this;
        function wrapData(raw: BaseRecord) {
            return new Proxy(raw, {
                set: function (target, key: string, value) {
                    target[key] = value;
                    that.update(key);
                    return true;
                }
            });
        }

        function wrapRefer(raw: Record<string, string[]>) {
            return new Proxy(raw, {
                get: (target, key: string) => {
                    const value = target[key];
                    if (!value) return [];
                    return that.reference.list(value);
                },
                set: () => false
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            }) as any;
        }

        this._status = ModelStatus.INITED;

        this.app = config.app;
        this.reference = config.app.services.reference;

        this.id = config.id;
        this.key = config.key || '';
        
        this._rule = wrapData(config.rule);
        this._info = wrapData(config.info);
        this._state = wrapData(config.state);

        this._data = {
            ...config.rule,
            ...config.info,
            ...config.state
        };
        this.data = new Proxy(this._data, {
            get: this._compute.bind(this),
            set: () => false
        });

        this._providers = config.providers;
        this._consumers = config.consumers;
        
        this.providers = wrapRefer(config.providers);
        this.consumers = wrapRefer(config.consumers); 
    }

    protected _onUpdateDone<
        T extends ModelDefinition,
        K extends keyof CacheOF<T>
    >(
        target: Model<T>,
        key: K,
        prev: CacheOF<T>[K],
        next: CacheOF<T>[K]
    ) { 
    }

    protected _onCheckBefore<
        T extends ModelDefinition,
        K extends keyof CacheOF<T>
    >(
        target: Model<T>,
        key: K,
        prev: CacheOF<T>[K]
    ): CacheOF<T>[K] { 
        return prev; 
    }
    
    protected abstract _compute<
        K extends keyof DataOF<T>
    >(
        target: BaseRecord,
        key: K
    ): BaseRecord[K]

    
    @modelStatus(
        ModelStatus.MOUNTING,
        ModelStatus.MOUNTED
    )
    public update(key: keyof CacheOF<T>) {
        const prev = this._data[key];
        let result = {
            ...this._rule,
            ...this._info,
            ...this._state
        }[key];

        const modifiers = this.consumers.checkBefore;
        for (const modifier of modifiers) {
            result = modifier._onCheckBefore(this, key, result);
        }
        
        this._data[key] = result;
        if (prev !== result) {
            const listeners = this.consumers.updateDone;
            for (const listener of listeners) {
                listener._onUpdateDone(this, key, prev, result);
            }
        }
    }

    @modelStatus(ModelStatus.INITED)
    public mount(parent: ParentOF<T>) {
        this._status = ModelStatus.MOUNTING;
        this.reference.add(this);
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
        this.reference.remove(this);
        this._parent = undefined; 
        this._status = ModelStatus.UNMOUNTED; 
    }

    @modelStatus(ModelStatus.MOUNTED)
    protected _sub<M extends ModelDefinition>(
        target: Model<M>,
        key: keyof ProvidersOF<T> & keyof ConsumersOF<M>
    ) {
        const providers = this._providers[key];
        const consumers = target._consumers[key];

        if (providers) providers.push(target.key);
        else this._providers[key] = [target.key];

        if (consumers) consumers.push(this.key);
        else this._consumers[key] = [this.key];
    }

    @modelStatus(ModelStatus.UNMOUNTED)
    protected _unpub<M extends ModelDefinition>(
        target: Model<M>,
        key: keyof ProvidersOF<M> & keyof ConsumersOF<T>
    ) {
        target._unsub(this, key);
    }


    @modelStatus(ModelStatus.UNMOUNTED)
    protected _unsub<M extends ModelDefinition>(
        target: Model<M>,
        key: keyof ProvidersOF<T> & keyof ConsumersOF<M>
    ) {
        const providers = this._providers[key];
        const consumers = target._consumers[key];
        
        if (!providers || !consumers) throw new Exception();

        providers.splice(providers.indexOf(target.key), 1);
        consumers.splice(consumers.indexOf(this.key), 1);
    }

    public serialize(): ModelChunk<T> {
        return {
            id: this.id,
            key: this.key,
            rule: this._rule,
            state: this._state,
            providers: this._providers,
            consumers: this._consumers
        };
    }
}
