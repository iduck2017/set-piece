import { APP_VERSION } from "../configs/base";
import { ModelId } from "../types/registry";
import { product } from "../utils/product";
import { IRootModel, RootChunk, RootConfig } from "../types/root";

@product(ModelId.ROOT)
export class RootModel extends IRootModel {
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
            emitters: {
                checkBefore: [],
                updateDone: []
            },
            handlers: {
                checkBefore: [],
                updateDone: []
            }
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