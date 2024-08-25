import type { App } from "../app";
import { ModelTmpl } from "../type/template";
import { RawModelEmitterEventDict, ModelReflect } from "../type/model";
import { Emitter } from "../utils/emitter";
import { Handler } from "../utils/handler";
import { Delegator } from "../utils/delegator";
import { Base, Reflect } from "../type";
import { EventReflect, Event } from "../type/event";
import { ModelDef } from "../type/definition";
import { ModelConfig } from "../type/config";
import { ModelChunk } from "../type/chunk";

export class Model<
    M extends ModelTmpl = ModelTmpl
> {
    public readonly code: M[ModelDef.Code];
    public readonly app: App;
    public readonly id: string;
    public readonly parent: M[ModelDef.Parent];

    private readonly $rule: Partial<M[ModelDef.Rule]>;
    private readonly $stableState: M[ModelDef.StableState];
    protected readonly $unstableState: M[ModelDef.UnstableState];
    private readonly $state: ModelReflect.State<M>;
    public get state() { return { ...this.$state }; }
    
    private readonly $updaterDict: ModelReflect.UpdaterDict<M>;
    public readonly updaterBindIntf: EventReflect.BindIntf<{
        [K in keyof ModelReflect.State<M>]: Event.StateUpdateBefore<M, K>
    }>;

    private readonly $childDict: M[ModelDef.ChildDict];
    private readonly $childList: M[ModelDef.ChildList];

    public get childDict() { return { ...this.$childDict }; }
    public get childList() { return [ ...this.$childList ]; }
    public get children() {
        return this.$childList.concat(Object.values(this.$childDict));
    }

    private readonly $emitterDict: EventReflect.EmitterDict<ModelReflect.EmitterEventDict<M>>;
    private readonly $handlerDict: EventReflect.HandlerDict<M[ModelDef.HandlerEventDict]>;
    private readonly $rawEmitterDict: {
        [K in keyof RawModelEmitterEventDict<M>]:
            Emitter<RawModelEmitterEventDict<M>[K]>
    };
    public readonly emitterBindIntf: EventReflect.BindIntf<ModelReflect.EmitterEventDict<M>>;
    public readonly emitterUnbindIntf: EventReflect.BindIntf<ModelReflect.EmitterEventDict<M>>;
    
    public readonly debugIntf: Record<string, Base.Func>;

    constructor(
        handlerExecuteIntf: EventReflect.ExecuteIntf<M[ModelDef.HandlerEventDict]>,
        config: ModelConfig<M>,
        parent: M[ModelDef.Parent],
        app: App
    ) {
        this.app = app;
        this.code = config.code;
        this.id = config.id || app.referService.getUniqId();
        this.parent = parent;

        this.$rule = config.rule || {};
        this.$stableState = config.stableState;
        this.$unstableState = Delegator.initUnstableState(config.unstableState, this);
        this.$state = {
            ...this.$stableState,
            ...this.$unstableState
        };

        this.$updaterDict = Delegator.initUpdaterDict(config.updaterChunkDict || {}, this, app);
        this.updaterBindIntf = Delegator.initBindIntf<{ 
            [K in keyof ModelReflect.State<M>]: Event.StateUpdateBefore<M, K>
        }>(this.$updaterDict);
        
        this.$childList = 
            config.childChunkList?.map(item => app.factoryService.unserialize(item, this)) || [];
        this.$childDict = Delegator.initChildDict(config.childChunkDict, this, app);
        this.$emitterDict = Delegator.initEmitterDict(config.emitterChunkDict || {}, this, app);
        this.$rawEmitterDict = this.$emitterDict;

        this.emitterBindIntf = Delegator.initBindIntf(this.$emitterDict);
        this.emitterUnbindIntf = Delegator.initUnbindIntf(this.$emitterDict);
        this.$handlerDict = Delegator.initHandlerDict(
            handlerExecuteIntf,
            config.handlerChunkDict || {},
            parent,
            app
        );

        this.debugIntf = {};
    }

    
    protected $addChild(target: Reflect.Iterator<M[ModelDef.ChildList]>) {
        this.$childList.push(target);
        this.$rawEmitterDict.childUpdateDone.execute({
            target: this,
            children: this.children
        });
    }

    protected $removeChild(target: Model) {
        const index = this.$childList.indexOf(target);
        if (index >= 0) {
            this.$childList.splice(index, 1); 
            this.$rawEmitterDict.childUpdateDone.execute({
                target: this,
                children: this.children
            });
            return;
        }
        Object.keys(this.$childDict).forEach(key => {
            if (this.$childDict[key] === target) {
                delete this.$childDict[key];
                this.$rawEmitterDict.childUpdateDone.execute({
                    target: this,
                    children: this.children
                });
                return;
            }
        });
        throw new Error();
    }

    public destroy() {
        this.$childList.forEach(item => item.destroy());
        Object.values(this.$childDict).forEach(item => item.destroy());
        Object.values({
            ...this.$emitterDict,
            ...this.$handlerDict,
            ...this.$updaterDict
        }).forEach(item => item.destroy());
        if (this.parent) {
            this.parent.$removeChild(this as Model);
        }
    }

    public updateState<
        K extends keyof ModelReflect.State<M>
    >(key: K) {
        const prev = this.$state[key];
        const current = this.$stableState[key] || this.$unstableState[key];
        const event = {
            target: this,
            prev: current,
            next: current
        };
        this.$updaterDict[key].execute(event);
        const next = event.next;
        if (prev !== next) {
            this.$state[key] = next;
            this.$rawEmitterDict.stateUpdateDone.execute({
                target: this,
                state: this.state
            });
        }
    }

    public serializeEntity(entityDict: Record<string, Emitter | Handler>) {
        return Object
            .keys(entityDict)
            .reduce((dict, key) => ({
                ...dict,
                [key]: entityDict[key].serialize()   
            }), {});
    }

    public serialize(): ModelChunk<M> {
        return {
            code: this.code,
            id: this.id,
            rule: this.$rule,
            unstableState: this.$unstableState,
            childChunkList: this.$childList.map(item => item.serialize() as any),
            childChunkDict: Object
                .keys(this.$childDict)
                .reduce((dict, key) => ({
                    ...dict,
                    [key]: this.$childDict[key].serialize()   
                }), {} as any),
            emitterChunkDict: this.serializeEntity(this.$emitterDict),
            handlerChunkDict: this.serializeEntity(this.$handlerDict),
            updaterChunkDict: this.serializeEntity(this.$updaterDict)
        };
    }
}