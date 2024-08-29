import type { App } from "../app";
import { IBase } from "../type";
import { IConnector } from "../type/connector";
import { Entity } from "./entity";
import { Handler } from "./handler";

/** 接收器代理 */
export class HandlerProxy<
    D extends IBase.Dict, 
    P = any
> extends Entity {
    public readonly parent: P;

    /** 事件触发器集合 */
    private readonly $handlerDict: IConnector.HandlerDict<D, P>;
    public get handlerDict() {
        return { ...this.$handlerDict };
    }

    constructor(
        config: IConnector.ConfigDict<D>,
        parent: P,
        app: App
    ) {
        super(app);
        this.parent = parent;
        /** 事件触发器集合 */
        this.$handlerDict = {} as IConnector.HandlerDict<D, P>;
        for (const key in config) {
            this.$handlerDict[key] = new Handler(
                config[key] || {}, 
                parent,
                app
            );  
        }
    }

    /** 初始化函数，注入事件处理函数 */
    public initialize(
        callerDict: IConnector.CallerDict<D>
    ) {
        for (const key in callerDict) {
            if (!this.$handlerDict[key]) {
                this.$handlerDict[key] = new Handler(
                    {},
                    this.parent,
                    this.app
                );
            }
            this.$handlerDict[key].handleEvent = 
                callerDict[key].bind(this.parent);
        }
    }

    public serialize(): IConnector.ChunkDict<D> {
        const result = {} as IConnector.ChunkDict<D>;
        for (const key in this.handlerDict) {
            result[key] = this.handlerDict[key].serialize();
        }
        return result;
    }

    public destroy() {
        Object.values(this.handlerDict).forEach(item => {
            item.destroy();
        });
    }
}
