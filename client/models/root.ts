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
import { VoidData } from "../types/base";
import type { App } from "../app";
import { DictModel } from "./dict";
import { EventId } from "../types/events";
import { BunnyModel } from "./bunny";

@product(ModelId.ROOT)
export class RootModel extends DictModel<
    ModelId.ROOT,
    never,
    never,
    RootRule,
    VoidData,
    RootState,
    App,
    RootChildren
> {
    private _version: string;

    constructor(config: RootConfig, app: App) {
        super({
            ...config,
            modelId: ModelId.ROOT,
            info: {},
            state: {
                progress: 0,
                ...config.state
            },
            handlers: {},
            emitters: {},
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

    protected _handle = {
        [EventId.CHECK_BEFORE]: this._handleCheckBefore,
        [EventId.UPDATE_DONE]: this._handleUpdateDone    
    };
}