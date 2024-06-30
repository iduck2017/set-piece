import { APP_VERSION } from "../configs/base";
import { ModelId } from "../types/registry";
import { product } from "../utils/product";
import { RootChunk, RootConfig, RootRule, RootState } from "../types/root";
import { PartialOf, VoidData } from "../types/base";
import type { App } from "../app";
import { DictModel } from "./dict";
import { modelEmitters, modelHandlers } from "../configs/refer";
import { EventId, EventRegistry } from "../types/events";
import { ModelEvent } from "../types/model";

@product(ModelId.ROOT)
export class RootModel extends DictModel<
    ModelId.ROOT,
    never,
    never,
    RootRule,
    VoidData,
    RootState,
    App,
    VoidData
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
            handlers: modelHandlers(),
            emitters: modelEmitters(),
            children: {},
        }, app);
        this._version = APP_VERSION;
    }

    public serialize(): RootChunk {
        return {
            ...super.serialize(),
            version: this._version
        };
    }

    protected handle: PartialOf<EventRegistry, ModelEvent> = {
        [EventId.CHECK_BEFORE]: this._handleCheckBefore,
        [EventId.UPDATE_DONE]: this._handleUpdateDone,    
    }
}