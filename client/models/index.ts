import type { App } from "../app";
import { ModelTmpl } from "../type/template";
import { EmitterProxy } from "../utils/emitter";
import { HandlerProxy } from "../utils/handler";
import { Delegator } from "../utils/delegator";
import { Base, Reflect } from "../type";
import { EventReflect } from "../type/event";
import { ModelDef } from "../type/definition";
import { ModelConfig } from "../type/config";
import { ModelChunk } from "../type/chunk";
import { UpdaterProxy } from "../utils/updater";

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
    public get state() { return { ...this.$currentState }; }
    
    private readonly $childDict: M[ModelDef.ChildDict];
    private readonly $childList: M[ModelDef.ChildList];
    public get childDict() { return { ...this.$childDict }; }
    public get childList() { return [ ...this.$childList ]; }
    public get children() {
        return this.$childList.concat(Object.values(this.$childDict));
    }

    private readonly $updaterProxy: UpdaterProxy<M>;
    protected readonly $handlerProxy: HandlerProxy<M[ModelDef.HandlerEventDict], Model<M>>;
    protected readonly $emitterProxy: EmitterProxy<M[ModelDef.EmitterEventDict], Model<M>>;
    public get emitterBindIntf() { return this.$emitterProxy.bindIntf; }
    public get emitterUnbindIntf() { return this.$emitterProxy.unbindIntf; }
    public get updaterBindIntf() { return this.$updaterProxy.bindIntf; }
    public get updaterUnbindIntf() { return this.$updaterProxy.unbindIntf; }

    public readonly debugIntf: Record<string, Base.Func>;

    constructor(
        intf: EventReflect.ExecuteIntf<M[ModelDef.HandlerEventDict]>,
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

        this.$childList = 
            config.childChunkList?.map(item => app.factoryService.unserialize(item, this)) || [];
        this.$childDict = Delegator.initChildDict(config.childChunkDict, this, app);

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
            intf,
            config.handlerChunkDict || {},
            this,
            app
        );

        this.debugIntf = {};
    }

    
    protected $addChild(target: Reflect.Iterator<M[ModelDef.ChildList]>) {
        this.$childList.push(target);
        this.$emitterProxy.dict.childUpdateDone.execute({
            target: this,
            children: this.children
        });
    }

    protected $removeChild(target: Model) {
        const index = this.$childList.indexOf(target);
        if (index >= 0) {
            this.$childList.splice(index, 1); 
            this.$emitterProxy.dict.childUpdateDone.execute({
                target: this,
                children: this.children
            });
            return;
        }
        Object.keys(this.$childDict).forEach(key => {
            if (this.$childDict[key] === target) {
                delete this.$childDict[key];
                this.$emitterProxy.dict.childUpdateDone.execute({
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
        this.$updaterProxy.dict[key].execute(event);
        const next = event.next;
        if (prev !== next) {
            this.$currentState[key] = next;
            this.$emitterProxy.dict.stateUpdateDone.execute({
                target: this,
                state: this.state
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
            childChunkList: this.$childList.map(item => item.serialize() as any),
            childChunkDict: Object
                .keys(this.$childDict)
                .reduce((dict, key) => ({
                    ...dict,
                    [key]: this.$childDict[key].serialize()   
                }), {} as any)
        };
    }
}