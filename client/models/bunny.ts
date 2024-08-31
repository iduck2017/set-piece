import { Model } from ".";
import type { App } from "../app";
import { IModelDef, ModelCode, ModelKey } from "../type/definition";
import { IModel } from "../type/model";
import { Decorators } from "../utils/decorators";
import { Random } from "../utils/random";

export class BunnyModel extends Model<IModelDef.Bunny> {
    constructor(
        config: IModel.RawConfig<IModelDef.Bunny>,
        parent: IModelDef.Bunny[ModelKey.Parent],
        app: App
    ) {
        super({
            ...config,
            code: ModelCode.Bunny,
            originState: {
                age: 0,
                weight: Random.number(30, 50),
                ...config.originState,
                maxAge: 10
            },
            childChunkList: config.childChunkList || [],
            childChunkDict: {}
        }, parent, app);
        this.testcaseDict = {
            eatFoood: this.eatFood,
            spawnChild: this.spawnChild,
            growUp: this.growUp
        };
        this.$handlerProxy.initialize({
            timeUpdateDone: this.growUp
        });
    }

    public initialize() {
        console.log("Bunny is initializing...");
        const timer = this.root.childDict.time;
        timer.emitterDict.timeUpdateDone.bindHandler(
            this.$handlerDict.timeUpdateDone
        );
    }

    /** 吃食物 */
    @Decorators.usecase()
    public eatFood() {
        this.$originState.weight += Random.number(1, 5);
    }

    /** 繁殖幼崽 */
    public spawnChild() {
        const child = this.root.spawnCreature({ code: ModelCode.Bunny });
        child.initialize();
    }

    /** 年龄增长 */
    public growUp() {
        console.log("Bunny is growing up...");
        this.$originState.age += 1;
        if (this.currentState.age >= this.currentState.maxAge) {
            this.$die();
        }
    }

    private $die() {
        console.log("Bunny is dead...", this.parent);
        this.$destroy();
    }
}