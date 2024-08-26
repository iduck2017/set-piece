import { Model } from ".";
import type { App } from "../app";
import { ModelCode } from "../type/code";
import { RootModelTmpl } from "../type/common";
import { RawModelConfig } from "../type/config";
import { ModelDef } from "../type/definition";

export class RootModel extends Model<RootModelTmpl> {
    constructor(
        config: RawModelConfig<RootModelTmpl>,
        parent: RootModelTmpl[ModelDef.Parent],
        app: App
    ) {
        super({}, {
            ...config,
            originState: {
                progress: 0,
                ...config.originState
            },
            childChunkDict: {
                bunny: config.childChunkDict?.bunny || {
                    code: ModelCode.Bunny
                }
            },
            childChunkList: []
        }, parent, app);
    }
}