import { Model } from ".";
import type { App } from "../app";
import { ModelCode } from "../type/code";
import type { BunnyModelTmpl } from "../type/common";
import { RawModelConfig } from "../type/config";
import { ModelDef } from "../type/definition";
import { SpecificModelTmpl } from "../type/template";
import { Random } from "../utils/random";

export class BunnyModel extends Model<BunnyModelTmpl> {
    constructor(
        config: RawModelConfig<BunnyModelTmpl>,
        parent: BunnyModelTmpl[ModelDef.Parent],
        app: App
    ) {
        super({}, {
            ...config,
            code: ModelCode.Bunny,
            stableState: {
                maxAge: 0,
                maxWeight: 0
            },
            unstableState: {
                age: 0,
                color: '',
                maxAgeOffset: 0,
                weight: Random.number(30, 50),
                ...config.unstableState
            },
            childChunkList: config.childChunkList || [],
            childChunkDict: {}
        }, parent, app);
        this.debugIntf.eat = this.eatFood;
        this.debugIntf.spawn = this.spawnChild;
    }

    public eatFood() {
        this.$unstableState.weight += Random.number(1, 5);
    }

    public spawnChild() {
        const child = this.app.factoryService.unserialize<BunnyModel>({
            code: ModelCode.Bunny
        }, this);
        this.$addChild(child);
    }
}