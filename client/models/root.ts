import { Model } from ".";
import type { App } from "../app";
import { IModelDef, ModelCode, ModelKey } from "../type/definition";
import { IModel } from "../type/model";
import { BunnyModel } from "./bunny";

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

    public async spawnCreature(bunny: BunnyModel): Promise<void> {
        this.$appendChild(bunny);
        bunny.initialize();
    }

    public umountRoot(): void {
        this.$destroy();
    }
}