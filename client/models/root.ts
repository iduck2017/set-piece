import { APP_VERSION } from "../configs/base";
import { ModelId } from "../types/registry";
import { product } from "../utils/product";
import { 
    RootChildren, 
    RootChunk, 
    RootConfig, 
    RootRule, 
    RootState 
} from "../types/root";
import type { App } from "../app";
import { VoidData } from "../types/base";
import { DictModel } from "./dict";
import { BunnyModel } from "./bunny";
import { Consumer } from "./node";

@product(ModelId.ROOT)
export class RootModel extends DictModel<
    ModelId.ROOT,
    VoidData,
    VoidData,
    RootRule,
    VoidData,
    RootState,
    App,
    RootChildren
> {
    private _version: string;
    public consumer = new Consumer({});

    constructor(config: RootConfig, app: App) {
        super({
            ...config,
            modelId: ModelId.ROOT,
            info: {},
            stat: {
                progress: 0,
                ...config.stat
            },
            consumer: {},
            provider: {},
            children: {
                bunny: 
                    config.children?.bunny || 
                    new BunnyModel({ rule: {} }, app)
            }
        }, app);
        this._version = APP_VERSION;
    }

    public serialize(): RootChunk {
        return {
            ...super.serialize(),
            version: this._version
        };
    }

}