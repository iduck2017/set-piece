import { Model } from ".";
import type { App } from "../app";
import { ModelCode } from "../type/code";
import type { BunnyModelTmpl } from "../type/common";
import { RawModelConfig } from "../type/config";
import { ModelDef } from "../type/definition";
import { Random } from "../utils/random";

export class BunnyModel extends Model<BunnyModelTmpl> {
    constructor(
        config: RawModelConfig<BunnyModelTmpl>,
        parent: BunnyModelTmpl[ModelDef.Parent],
        app: App
    ) {
        super({
            ...config,
            code: ModelCode.Bunny,
            originState: {
                age: 0,
                color: '',
                maxWeight: 0,
                maxAgeOffset: 0,
                weight: Random.number(30, 50),
                ...config.originState
            },
            childChunkList: config.childChunkList || [],
            childChunkDict: {}
        }, parent, app);
        this.testcaseDict.eat = this.eatFood;
        this.testcaseDict.spawn = this.spawnChild;
    }

    public eatFood() {
        console.log("eatFood");
        this.$originState.weight += Random.number(1, 5);
    }

    public spawnChild() {
        const child = this.app.factoryService.unserialize<BunnyModel>({
            code: ModelCode.Bunny
        }, this);
        this.$addChild(child);
    }
}