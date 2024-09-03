import type { App } from "../app";
import { IBase, IReflect } from "../type";
import { UpdaterProxy } from "../utils/updater-proxy";
import { HandlerProxy } from "../utils/handler-proxy";
import { EmitterProxy } from "../utils/emitter-proxy";
import { BaseModelDef, CommonModelDef } from "../type/definition";
import { ModelType } from "../type/model";
import { ConnectorType } from "../type/connector";
import { ModelKey } from "../type/registry";


/**
 * 反序列化阶段
 * 1. 节点被创建 Inited
 * 2. 节点挂载到父节点 Binded
 * 3. 节点挂载到根节点 Mounted
 * 
 * 初始化阶段
 * 4. 节点业务逻辑执行 Activated
 * 5. 节点业务状态流转，例如生物成熟、生殖死亡
 * 6. 节点业务逻辑销毁 Deactivated 
 * 
 * 销毁阶段
 * 7. 节点卸载自根节点 Unmounted
 * 8. 节点卸载自父节点 Unbinded
 * 9. 节点销毁完成 Destroyed
 */
export abstract class Model<
    M extends BaseModelDef = BaseModelDef
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
    public readonly $childDict: ModelType.ChildDict<M>;
    public readonly $childList: ModelType.ChildList<M>;
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


    /** 事件触发器 */
    protected readonly $emitterModelDict: ModelType.EmitterModelDict<M>;
    protected readonly $handlerModelDict: ModelType.HandlerModelDict<M>;
    protected readonly $updaterModelDict: ModelType.UpdaterModelDict<M>;
    protected abstract readonly $handlerCallerDict: 
        ModelType.CallerDict<M[ModelKey.HandlerEventDict]>;
    protected readonly $emitterCallerDict: ModelType.CallerDict<M[ModelKey.EmitterEventDict]>;
    public readonly emitterBinderDict: ModelType.EmitterBinderDict<M>;
    public readonly emitterUnbinderDict: ModelType.EmitterBinderDict<M>;
    public readonly updaterBinderDict: ModelType.UpdaterBinderDict<M>;
    public readonly updaterUnbinderDict: ModelType.UpdaterBinderDict<M>;

    protected $callEvent<K extends keyof M[ModelKey.EmitterEventDict]>(
        key: K,
        event: M[ModelKey.EmitterEventDict][K]
    ) {
        const emitterModelList = this.$emitterModelDict[key];
        for (const model of emitterModelList || []) {
            model.$handlerCallerDict[key](event);
        }
    }

    protected $bindHandler<K extends keyof M[ModelKey.EmitterEventDict]>(
        key: K,
        handler: Model<CommonModelDef<{
            emitterEventDict: 
                Pick<M[ModelKey.HandlerEventDict], K> & 
                ModelType.BaseEmitterEventDict<M>
        }>>
    ) {
        if (!handler.$handlerModelDict[key]) {
            handler.$handlerModelDict[key] = [];
        }
        handler.$handlerModelDict[key]?.push(this as any);
        this.$emitterModelDict[key]?.push(handler as any);
    }

    public unserializeModelDict<
        T extends Record<IBase.Key, Model[] | undefined>
    >(chunk: Record<keyof T, string[] | undefined> | undefined) {
        const modelDict = {} as T;
        for (const key in chunk) {
            if (!modelDict[key]) {
                modelDict[key] = [] as any;
            }
            for (const id of chunk[key] || []) {
                const model = this.app.referService.modelReferManager.referDict[id];
                if (model) {
                    modelDict[key]?.push(model);
                }
            }
        }
        return modelDict;
    }


    /** 状态修饰器代理 */
    // private readonly $updaterProxy: UpdaterProxy<M>;
    // protected readonly $updaterDict: ModelType.UpdaterDict<M>;
    // public readonly updaterDict: ModelType.SafeUpdaterDict<M>;

    /** 事件接收器代理 */
    // private readonly $handlerProxy: HandlerProxy<M[ModelKey.HandlerEventDict], Model<M>>;
    // protected readonly $handlerDict: 
    //     ConnectorType.HandlerDict<M[ModelKey.HandlerEventDict], Model<M>>;

    /** 事件触发器代理 */
    // private readonly $emitterProxy: EmitterProxy<M[ModelKey.EmitterEventDict], Model<M>>;
    // protected readonly $emitterDict: 
    //     ConnectorType.EmitterDict<M[ModelKey.EmitterEventDict], Model<M>>;
    // public readonly emitterDict: 
    //     ConnectorType.SafeEmitterDict<M[ModelKey.EmitterEventDict], Model<M>>;

    /** 测试用例 */
    public testcaseDict: Record<string, IBase.Func>;

    constructor(
        loader: ConnectorType.CallerDict<M[ModelKey.HandlerEventDict]>, 
        config: ModelType.Config<M>,
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
        // this.$updaterProxy = new UpdaterProxy<M>(
        //     config.updaterChunkDict, 
        //     this,
        //     app
        // );
        // this.$updaterDict = this.$updaterProxy.updaterDict;
        // this.updaterDict = this.$updaterProxy.safeUpdaterDict;
        
        // /** 初始化事件触发器 */
        // this.$emitterProxy = new EmitterProxy(
        //     config.emitterChunkDict, 
        //     this,
        //     app
        // );
        // this.$emitterDict = this.$emitterProxy.emitterDict;
        // this.emitterDict = this.$emitterProxy.safeEmitterDict;

        // this.$handlerProxy = new HandlerProxy(
        //     loader,
        //     config.handlerChunkDict,
        //     this,
        //     app
        // );
        // this.$handlerDict = this.$handlerProxy.handlerDict;


        this.$handlerModelDict = this.unserializeModelDict(config.handlerChunkDict);
        this.$emitterModelDict = this.unserializeModelDict<
            ModelType.EmitterModelDict<M>
        >(config.emitterChunkDict);
        this.$updaterModelDict = this.unserializeModelDict<
            ModelType.UpdaterModelDict<M>
        >(config.updaterChunkDict);

        this.$emitterModelDict = {} as ModelType.EmitterModelDict<M>;
        for (const key in config.emitterChunkDict) {
            this.$emitterModelDict[key] = [];
            config.emitterChunkDict[key]?.forEach(id => {
                const model: any = app.referService.modelReferManager.referDict[id];
                if (model) {
                    this.$emitterModelDict[key]?.push(model);
                }
            });
        }

        this.$updaterModelDict = {} as ModelType.UpdaterModelDict<M>;
        for (const key in config.updaterChunkDict) {
            this.$updaterModelDict[key] = [] as 
                ModelType.UpdaterModelDict<M>[keyof ModelType.UpdaterChunkDict<M>];
            (config.updaterChunkDict[key] as string[] | undefined)?.forEach(id => {
                const model: any = app.referService.modelReferManager.referDict[id];
                if (model) {
                    (this.$updaterModelDict[key] as any).push(model);
                }
            });
        }

        this.$emitterCallerDict = new Proxy(
            {} as ModelType.CallerDict<M[ModelKey.EmitterEventDict]>,
            {
                get: ($target, key) => {
                    return this.$callEvent.bind(
                        this, 
                        key as keyof M[ModelKey.EmitterEventDict]
                    );
                },
                set: () => false
            }
        );

        
        this.emitterBinderDict = new Proxy(
            {} as ModelType.EmitterBinderDict<M>,
            {
                get: ($target, key) => {
                    return this.$bindHandler.bind(
                        this, 
                        key as keyof M[ModelKey.EmitterEventDict]
                    );
                },
                set: () => false
            }
        );


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
        const origin = {} as ModelType.ChildDict<M>;
        for (const key in config.childChunkDict) {
            const chunk = config.childChunkDict[key];
            origin[key] = app.factoryService.unserialize(chunk, this);
        }
        this.$childDict = new Proxy(origin, {
            set: (origin, key: keyof M[ModelKey.ChildDefDict], value) => {
                origin[key] = value;
                this.$emitterCallerDict.childUpdateDone({
                    target: this,
                    children: this.children
                });
                return true;
            }
        });
        this.testcaseDict = {};
    }

    /** 初始化 */
    public $initialize() {
        this.$inited = true;
        this.$childList.forEach((child: Model) => {
            child.$initialize();
        });
        for (const key in this.$childDict) {
            const child: Model = this.childDict[key];
            child.$initialize();
        }
    }

    /** 添加子节点 */
    protected $appendChild(target: IReflect.Iterator<ModelType.ChildList<M>>) {
        this.$childList.push(target);
        this.$emitterCallerDict.childUpdateDone({
            target: this,
            children: this.children
        });
    }

    /** 移除子节点 */
    protected $removeChild(target: Model) {
        const index = this.$childList.indexOf(target as any);
        if (index >= 0) {
            this.$childList.splice(index, 1); 
            this.$emitterCallerDict.childUpdateDone({
                target: this,
                children: this.children
            });
            return;
        }
        for (const key in this.$childDict) {
            if (this.$childDict[key] === target) {
                delete this.$childDict[key];
                this.$emitterCallerDict.childUpdateDone({
                    target: this,
                    children: this.children  
                });
                return;
            }
        }
        throw new Error();
    }

    protected $destroy() {
        // this.$emitterProxy.destroy();
        // this.$handlerProxy.destroy();
        // this.$updaterProxy.destroy();
        this.$childList.forEach((child: Model) => {
            child.$destroy();
        });
        for (const key in this.$childDict) {
            const child: Model = this.childDict[key];
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
        const updateBefore: ModelType.StateUpdateBefore<K> = `${key as string}UpdateBefore`;
        for (const model of this.$updaterModelDict[updateBefore] || []) {
            model.$handlerCallerDict[updateBefore](event);
        }
        const next = event.next;
        if (prev !== next) {
            this.$currentState[key] = next;
            this.$emitterCallerDict.stateUpdateDone({
                target: this,
                state: this.currentState
            });
        }
    }

    /** 序列化函数 */
    public serialize(): ModelType.Chunk<M> {
        const childChunkDict = {} as any;
        for (const key in this.childDict) {
            const child = this.childDict[key];
            childChunkDict[key] = child.serialize();
        }
        const childChunkList = this.childList.map(child => {
            return child.serialize(); 
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