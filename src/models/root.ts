import { APP_VERSION } from "../configs/base";
import { ModelId } from "../types/registry";
import { product } from "../utils/product";
import { RootChunk, RootConfig, RootRule, RootState } from "../types/root";
import { VoidData } from "../types/base";
import { ModelRefer } from "../types/common";
import type { App } from "../app";
import { DictModel } from "./dict";
import { modelRefer } from "../configs/refer";

@product(ModelId.ROOT)
export class RootModel extends DictModel<
    ModelId.ROOT,
    RootRule,
    VoidData,
    RootState,
    ModelRefer,
    ModelRefer,
    App,
    VoidData
> {
    private _version: string;

    constructor(config: RootConfig) {
        super({
            ...config,
            modelId: ModelId.ROOT,
            info: {},
            state: {
                progress: 0,
                ...config.state
            },
            children: {},
            emitters: modelRefer(),
            handlers: modelRefer()
        });
        this._version = APP_VERSION;
    }

    public serialize(): RootChunk {
        return {
            ...super.serialize(),
            version: this._version
        };
    }
}