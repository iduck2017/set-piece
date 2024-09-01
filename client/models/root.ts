import { Model } from ".";
import type { App } from "../app";
import { IModelDef } from "../type/definition";
import { ModelDecl } from "../type/model";
import { ModelCode, ModelKey } from "../type/registry";

export class RootModel extends Model<IModelDef.Root> {
    constructor(
        config: ModelDecl.RawConfig<IModelDef.Root>,
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

    public spawnCreature(bunny: ModelDecl.RawConfig<IModelDef.Bunny>) {
        const child = this.app.factoryService.unserialize(bunny, this);
        this.$appendChild(child);
        child.$initialize();
        return child;
    }

    public destroy(): void {
        this.$destroy();
    }
}