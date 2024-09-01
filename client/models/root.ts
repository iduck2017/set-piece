import { Model } from ".";
import type { App } from "../app";
import { IModelDef } from "../type/definition";
import { IModel } from "../type/model";
import { ModelCode, ModelKey } from "../type/registry";
import { BunnyModel } from "./bunny";

export class RootModel extends Model<IModelDef.Root> {
    constructor(
        config: IModel.RawConfig<IModelDef.Root>,
        parent: IModelDef.Root[ModelKey.Parent],
        app: App
    ) {
        super(
            {},
            {
                ...config,
                originState: {
                    progress: 0,
                    ...config.originState
                },
                childChunkDict: {
                    time: config.childChunkDict?.time || {
                        code: ModelCode.Time
                    }
                },
                childChunkList: config.childChunkList || [
                    { code: ModelCode.Bunny }
                ]
            },
            parent,
            app
        );
    }

    public spawnCreature(bunny: IModel.RawConfig<IModelDef.Bunny>) {
        const child = this.app.factoryService.unserialize<BunnyModel>(bunny, this);
        this.$appendChild(child);
        return child;
    }

    public umountRoot(): void {
        this.$destroy();
    }
}