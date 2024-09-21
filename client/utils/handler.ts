import type { App } from "../app";
import type { Model } from "../models";
import type { Emitter } from "./emitter";

/** 事件处理器 */
export class Handler<E = any> {
    private readonly $app: App;

    public readonly model: Model;
    public readonly handlerKey: string;

    private readonly $emitterBundleList: [string, string][];
    private readonly $emitterList: Emitter<E>[];

    public handleEvent(event: E) {  
        this.model.$handlerCallerDict[this.handlerKey].call(this.model, event);
    }

    constructor(
        emitterBundleList: [string, string][],
        handlerKey: string,
        model: Model,
        app: App
    ) {
        this.$app = app;
        this.model = model;
        this.handlerKey = handlerKey;
        this.$emitterBundleList = emitterBundleList;
        this.$emitterList = [];
    }

    /** 添加事件处理器 */
    public $addEmitter(eventEmitter: Emitter<E>) {
        this.$emitterList.push(eventEmitter);
    }

    /** 移除事件处理器 */
    public $removeEmitter(eventEmitter: Emitter<E>) {
        const index = this.$emitterList.indexOf(eventEmitter);
        if (index >= 0) {
            this.$emitterList.splice(index, 1);
        }
    }

    /** 挂载到根节点，构建依赖关系 */
    public mountRoot() {
        this.$emitterBundleList.forEach(([ modelId, emitterKey ]) => {
            const model = this.$app.referenceService.referDict[modelId];
            if (model) {
                model.eventEmitterDict[emitterKey].bindHandler(this);
            }
        });
    }

    /** 构建序列化参数 */
    public makeBundle(): [string, string][] {
        const bundle: [string, string][] = [];
        for (const emitter of this.$emitterList) {
            if (emitter.model && emitter.emitterKey) {
                bundle.push([
                    emitter.model.id,
                    emitter.emitterKey
                ]);
            }
        }
        return bundle;
    }

    /** 从根节点卸载，解除依赖关系  */
    public unmountRoot() {
        this.$emitterList.forEach(item => {
            item.unbindHandler(this);
        });
    }
}