import { Model } from ".";
import type { App } from "../app";
import { IModelDef, ModelCode, ModelKey } from "../type/definition";
import { IModel } from "../type/model";

export class RootModel extends Model<IModelDef.Root> {
    constructor(
        config: IModel.RawConfig<IModelDef.Root>,
        parent: IModelDef.Root[ModelKey.Parent],
        app: App
    ) {
        super({
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
        }, parent, app);
    }

    public spawnCreature(bunny: IModel.RawConfig<IModelDef.Bunny>) {
        const child = this.app.factoryService.unserialize(bunny, this);
        this.$appendChild(child);
        return child;
    }

    public umountRoot(): void {
        this.$destroy();
    }
}