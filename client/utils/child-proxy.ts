import type { App } from "../app";
import type { Model } from "../models";
import { ModelConfig } from "../type/config";
import { ModelDef } from "../type/definition";
import { ModelTmpl } from "../type/template";

/** 模型子节点代理 */
export class ChildProxy<
    M extends ModelTmpl
> {
    /** 子节点映射 */
    public readonly childDict: M[ModelDef.ChildDict];
    /** 子节点数组 */
    public readonly childList: M[ModelDef.ChildList];

    constructor(
        config: ModelConfig<M>,
        parent: Model<M>,
        app: App
    ) {
        this.childList = config.childChunkList.map(chunk => {
            return app.factoryService.unserialize(chunk, parent);
        });
        this.childDict = {} as M[ModelDef.ChildDict];
        for (const key in config.childChunkDict) {
            const chunk = config.childChunkDict[key];
            this.childDict[key] = app.factoryService.unserialize(chunk, parent);
        }
    }

    /** 模型子节点序列化 */
    public serialize() {
        const childChunkDict = {} as any;
        for (const key in this.childDict) {
            const child = this.childDict[key];
            childChunkDict[key] = child.serialize();
        }
        const childChunkList = this.childList.map(child => {
            return child.serialize() as any;
        });
        return {
            childChunkDict,
            childChunkList
        };
    }

    /** 析构函数 */
    public destroy() {
        this.childList.forEach(child => child.destroy());
        for (const key in this.childDict) {
            const child = this.childDict[key];
            child.destroy();
        }
    }
}
