import type { App } from "../app";
import { IBase, IReflect } from "../type";
import { UpdaterProxy } from "../utils/updater-proxy";
import { HandlerProxy } from "../utils/handler-proxy";
import { EmitterProxy } from "../utils/emitter-proxy";
import { IModelDef } from "../type/definition";
import { IModel } from "../type/model";
import { IConnector } from "../type/connector";
import { ModelKey } from "../type/registry";

export abstract class Model<
    M extends IModelDef.Base = IModelDef.Base
> {
    /** 外部指针 */
    public readonly app: App;
    public readonly parent: M[ModelKey.Parent];
    public get root() {
        const result = this.app.root;
        if (!result) {
            throw new Error();
        }
        return result;
    }

    /** 基本信息 */
    public readonly id: string;
    public readonly code: M[ModelKey.Code];

    /** 预设参数 */
    protected $inited: boolean;
    private readonly $preset: Partial<M[ModelKey.Preset]>;

    /** 状态 */
    protected readonly $originState: M[ModelKey.State];
    private readonly $currentState: M[ModelKey.State]; 
    public get currentState() { 
        return { ...this.$currentState }; 
    }
    
    /** 子节点 */
    public readonly $childDict: M[ModelKey.ChildDict];
    public readonly $childList: M[ModelKey.ChildList];
    public get childList() {
        return [ ...this.$childList ];
    }
    public get childDict() {
        return { ...this.$childDict };
    }
    public get children(): Model[] {
        return [
            ...this.childList,
            ...Object.values(this.childDict)
        ];
    }
    
    /** 状态修饰器代理 */
    private readonly $updaterProxy: UpdaterProxy<M>;
    protected readonly $updaterDict: IModel.UpdaterDict<M>;
    public readonly updaterDict: IModel.SafeUpdaterDict<M>;

    /** 事件接收器代理 */
    private readonly $handlerProxy: HandlerProxy<M[ModelKey.HandlerEventDict], Model<M>>;
    protected readonly $handlerDict: IConnector.HandlerDict<M[ModelKey.HandlerEventDict], Model<M>>;
   
    /** 事件触发器代理 */
    private readonly $emitterProxy: EmitterProxy<M[ModelKey.EmitterEventDict], Model<M>>;
    protected readonly $emitterDict: IConnector.EmitterDict<M[ModelKey.EmitterEventDict], Model<M>>;
    public readonly emitterDict: IConnector.SafeEmitterDict<M[ModelKey.EmitterEventDict], Model<M>>;

    /** 测试用例 */
    public testcaseDict: Record<string, IBase.Func>;

    constructor(
        loader: IConnector.CallerDict<M[ModelKey.HandlerEventDict]>, 
        config: IModel.Config<M>,
        parent: M[ModelKey.Parent],
        app: App
    ) {
        this.app = app;
        this.parent = parent;

        /** 基本信息 */
        this.id = config.id || app.referService.getUniqId();
        this.code = config.code;
        this.$inited = config.inited || false;
        this.$preset = config.preset || {};
 
        /** 初始化状态更新器 */
        this.$updaterProxy = new UpdaterProxy<M>(
            config.updaterChunkDict, 
            this,
            app
        );
        this.$updaterDict = this.$updaterProxy.updaterDict;
        this.updaterDict = this.$updaterProxy.safeUpdaterDict;
        
        /** 初始化事件触发器 */
        this.$emitterProxy = new EmitterProxy(
            config.emitterChunkDict, 
            this,
            app
        );
        this.$emitterDict = this.$emitterProxy.emitterDict;
        this.emitterDict = this.$emitterProxy.safeEmitterDict;

        this.$handlerProxy = new HandlerProxy(
            loader,
            config.handlerChunkDict,
            this,
            app
        );
        this.$handlerDict = this.$handlerProxy.handlerDict;

        /** 初始化状态 */
        this.$originState = new Proxy(config.originState, {
            set: (origin, key: keyof M[ModelKey.State], value) => {
                origin[key] = value;
                this.updateState(key);
                return true;
            }
        });
        this.$currentState = { 
            ...this.$originState
        };

        /** 初始化节点 */
        this.$childList = config.childChunkList.map(chunk => {
            return app.factoryService.unserialize(chunk, this);
        });
        const origin = {} as M[ModelKey.ChildDict];
        for (const key in config.childChunkDict) {
            const chunk = config.childChunkDict[key];
            origin[key] = app.factoryService.unserialize(chunk, this);
        }
        this.$childDict = new Proxy(origin, {
            set: (origin, key: keyof M[ModelKey.ChildDict], value) => {
                origin[key] = value;
                this.$emitterDict.childUpdateDone.emitEvent({
                    target: this,
                    children: this.children
                });
                return true;
            }
        });
        this.testcaseDict = {};
    }

    /** 初始化 */
    protected $initialize() {
        this.$inited = true;
        this.$childList.forEach(child => child.$initialize());
        for (const key in this.$childDict) {
            const child = this.childDict[key];
            child.$initialize();
        }
    }

    /** 添加子节点 */
    protected $appendChild(target: IReflect.Iterator<M[ModelKey.ChildList]>) {
        this.$childList.push(target);
        this.$emitterDict.childUpdateDone.emitEvent({
            target: this,
            children: this.children
        });
    }

    /** 移除子节点 */
    protected $removeChild(target: Model) {
        const index = this.$childList.indexOf(target);
        if (index >= 0) {
            this.$childList.splice(index, 1); 
            this.$emitterDict.childUpdateDone.emitEvent({
                target: this,
                children: this.children
            });
            return;
        }
        for (const key in this.$childDict) {
            if (this.$childDict[key] === target) {
                delete this.$childDict[key];
                this.$emitterDict.childUpdateDone.emitEvent({
                    target: this,
                    children: this.children  
                });
                return;
            }
        }
        throw new Error();
    }

    protected $destroy() {
        this.$emitterProxy.destroy();
        this.$handlerProxy.destroy();
        this.$updaterProxy.destroy();
        this.$childList.forEach(child => child.$destroy());
        for (const key in this.$childDict) {
            const child = this.childDict[key];
            child.$destroy();
        }
        if (this.parent) {
            this.parent.$removeChild(this);
        }
    }

    /** 更新状态 */
    public updateState<
        K extends keyof M[ModelKey.State]
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
            this.$emitterDict.stateUpdateDone.emitEvent({
                target: this,
                state: this.currentState
            });
        }
    }

    /** 序列化函数 */
    public serialize(): IModel.Chunk<M> {
        const childChunkDict = {} as any;
        for (const key in this.childDict) {
            const child = this.childDict[key];
            childChunkDict[key] = child.serialize();
        }
        const childChunkList = this.childList.map(child => {
            return child.serialize() as any;
        });
        return {
            inited: true,
            id: this.id,
            code: this.code,
            preset: this.$preset,
            originState: this.$originState,
            childChunkDict,
            childChunkList,
            emitterChunkDict: this.$emitterProxy.serialize(),
            handlerChunkDict: this.$handlerProxy.serialize(),
            updaterChunkDict: this.$updaterProxy.serialize()
        };
    }
}