import type { App } from "../app";
import { ModelTmpl } from "../type/template";
import { Delegator } from "../utils/delegator";
import { Base, Reflect } from "../type";
import { ModelDef } from "../type/definition";
import { ModelConfig } from "../type/config";
import { ModelChunk } from "../type/chunk";
import { UpdaterProxy } from "../utils/updater-proxy";
import { HandlerProxy } from "../utils/handler-proxy";
import { EmitterProxy } from "../utils/emitter-proxy";
import { ChildProxy } from "../utils/child-proxy";

export class Model<
    M extends ModelTmpl = ModelTmpl
> {
    public readonly id: string;
    public readonly code: M[ModelDef.Code];
    
    public readonly app: App;
    public readonly parent: M[ModelDef.Parent];

    private readonly $rule: Partial<M[ModelDef.Rule]>;
    protected readonly $originState: M[ModelDef.State];
    private readonly $currentState: M[ModelDef.State];
    public get currentState() { return { ...this.$currentState }; }
    public get currentChildren(): Model[] {
        return [
            ...this.$childProxy.childList,
            ...Object.values(this.$childProxy.childDict)
        ];
    }
    
    protected readonly $childProxy: ChildProxy<M>;
    protected readonly $updaterProxy: UpdaterProxy<M>;
    protected readonly $handlerProxy: HandlerProxy<M[ModelDef.HandlerEventDict], Model<M>>;
    protected readonly $emitterProxy: EmitterProxy<M[ModelDef.EmitterEventDict], Model<M>>;

    public get emitterProxy() {
        return {
            ...this.$emitterProxy,
            emitterDict: undefined
        }; 
    }
    public get handlerProxy() {
        return {
            ...this.$handlerProxy,
            handlerDict: undefined
        }; 
    }

    public readonly debugIntf: Record<string, Base.Func>;

    constructor(
        config: ModelConfig<M>,
        parent: M[ModelDef.Parent],
        app: App
    ) {
        this.app = app;
        this.code = config.code;
        this.id = config.id || app.referService.getUniqId();
        this.parent = parent;

        this.$rule = config.rule || {};
        this.$originState = Delegator.initOriginState(config.originState, this);
        this.$currentState = { ...this.$originState };

        this.$childProxy = new ChildProxy(
            config,
            this,
            app
        );
        this.$updaterProxy = new UpdaterProxy<M>(
            config.updaterChunkDict || {},
            this,
            app
        );
        this.$emitterProxy = new EmitterProxy(
            config.emitterChunkDict || {}, 
            this,
            app
        );
        this.$handlerProxy = new HandlerProxy(
            config.handlerChunkDict || {},
            this,
            app
        );

        this.debugIntf = {};
    }

    
    protected $addChild(target: Reflect.Iterator<M[ModelDef.ChildList]>) {
        this.$childProxy.childList.push(target);
        this.$emitterProxy.emitterDict.childUpdateDone.emitEvent({
            target: this,
            children: this.currentChildren
        });
    }

    protected $removeChild(target: Model) {
        const index = this.$childProxy.childList.indexOf(target);
        if (index >= 0) {
            this.$childProxy.childList.splice(index, 1); 
            this.$emitterProxy.emitterDict.childUpdateDone.emitEvent({
                target: this,
                children: this.currentChildren
            });
            return;
        }
        for (const key in this.$childProxy.childDict) {
            if (this.$childProxy.childDict[key] === target) {
                delete this.$childProxy.childDict[key];
                this.$emitterProxy.emitterDict.childUpdateDone.emitEvent({
                    target: this,
                    children: this.currentChildren  
                });
                return;
            }
        }
        throw new Error();
    }

    public destroy() {
        this.$childProxy.destroy();
        this.$emitterProxy.destroy();
        this.$handlerProxy.destroy();
        this.$updaterProxy.destroy();
        if (this.parent) {
            this.parent.$removeChild(this as Model);
        }
    }

    public updateState<
        K extends keyof M[ModelDef.State]
    >(key: K) {
        const prev = this.$currentState[key];
        const current = this.$originState[key];
        const event = {
            target: this,
            prev: current,
            next: current
        };
        this.$updaterProxy.updaterDict[key].emitEvent(event);
        const next = event.next;
        if (prev !== next) {
            this.$currentState[key] = next;
            this.$emitterProxy.emitterDict.stateUpdateDone.emitEvent({
                target: this,
                state: this.currentState
            });
        }
    }

    public serialize(): ModelChunk<M> {
        return {
            id: this.id,
            code: this.code,
            rule: this.$rule,
            originState: this.$originState,
            emitterChunkDict: this.$emitterProxy.serialize(),
            handlerChunkDict: this.$handlerProxy.serialize(),
            updaterChunkDict: this.$updaterProxy.serialize(),
            ...this.$childProxy.serialize()
        };
    }
}