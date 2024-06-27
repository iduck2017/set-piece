import { APP_VERSION } from "../configs/base";
import { ModelID } from "../types";
import { RootChunk, RootTemplate } from "../types/root";
import { DictModel } from "./dict";
import { product } from "../utils/decors/product";
import { IDictConfig } from "../types/dict";
import { DataOF } from "../types/reflex";
import { BaseRecord } from "../types/base";

@product(ModelID.ROOT)
export class RootModel extends DictModel<RootTemplate> {
    private _version: string;

    constructor(config: IDictConfig<RootTemplate>) {
        super({
            ...config,
            id: ModelID.ROOT,
            info: {},
            state: {
                progress: 0,
                ...config.state
            },
            children: {},
            providers: {
                checkBefore: [],
                updateDone: []
            },
            consumers: {
                checkBefore: [],
                updateDone: []
            }
        });
        this._version = APP_VERSION;
    }
    
    protected _compute<K extends keyof DataOF<RootTemplate>>(
        target: BaseRecord, 
        key: K
    ) {
        if (key === 'time') return Date.now();
        return target[key];    
    }

    public serialize(): RootChunk {
        return {
            ...super.serialize(),
            version: this._version
        };
    }
}