import type { App } from "../app";
import { Base } from "../type";
import { LinkerType } from "../type/linker";
import { Entity } from "./entity";
import { Handler } from "./handler";

/** 接收器代理 */
export class HandlerProxy<
    D extends Base.Dict, 
    P = any
> extends Entity {
    public readonly parent: P;

    private readonly $handlerDict: LinkerType.HandlerDict<D, P>;
    public get handlerDict() {
        return { ...this.$handlerDict };
    }

    constructor(
        config: LinkerType.ConfigDict<D>,
        parent: P,
        app: App
    ) {
        super(app);
        this.parent = parent;
        /** 触发器集合 */
        this.$handlerDict = {} as LinkerType.HandlerDict<D, P>;
        for (const key in config) {
            this.$handlerDict[key] = new Handler(
                config[key] || {}, 
                parent,
                app
            );  
        }
    }

    public initialize(
        handlerIntf: LinkerType.HandlerIntf<D>
    ) {
        for (const key in handlerIntf) {
            if (!this.$handlerDict[key]) {
                this.$handlerDict[key] = new Handler(
                    {},
                    this.parent,
                    this.app
                );
            }
            this.$handlerDict[key].handleEvent = 
                handlerIntf[key].bind(this.parent);
        }
    }

    public serialize(): LinkerType.ChunkDict<D> {
        const result = {} as LinkerType.ChunkDict<D>;
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
