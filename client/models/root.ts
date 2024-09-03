import { Model } from ".";
import type { App } from "../app";
import { BunnyModelDef, RootModelDef } from "../type/definition";
import { ModelType } from "../type/model";
import { ModelCode, ModelKey } from "../type/registry";

export class RootModel extends Model<RootModelDef> {
    protected $handlerCallerDict: ModelType.HandlerCallerDict<RootModelDef> = {};

    constructor(
        config: ModelType.RawConfig<RootModelDef>,
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

    public spawnCreature(bunny: ModelType.RawConfig<BunnyModelDef>) {
        const child = this.app.factoryService.unserialize(bunny, this);
        this.$appendChild(child);
        child.$initialize();
        return child;
    }

    public destroy(): void {
        this.$destroy();
    }
}