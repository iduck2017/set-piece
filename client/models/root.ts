import { Model } from ".";
import type { App } from "../app";
import { BunnyModelDef, RootModelDef } from "../type/definition";
import { IModel } from "../type/model";
import { ModelCode, ModelKey } from "../type/registry";

export class RootModel extends Model<RootModelDef> {
    protected handleReqDict: IModel.HandleReqDict<RootModelDef> = {
        effect: {},
        reduce: {},
        update: {}
    };

    constructor(
        config: IModel.RawConfig<RootModelDef>,
        parent: RootModelDef[ModelKey.Parent],
        app: App
    ) {
        super(
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

    public spawnCreature(bunny: IModel.RawConfig<BunnyModelDef>) {
        const child = this.app.factoryService.unserialize(bunny, this);
        this.$appendChild(child);
        child.$initialize();
        return child;
    }

    public destroy(): void {
        this.$destroy();
    }
}