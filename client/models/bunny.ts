import { Model } from ".";
import type { App } from "../app";
import { IModelDef } from "../type/definition";
import { IModel } from "../type/model";
import { ModelCode, ModelKey } from "../type/registry";
import { Decorators } from "../utils/decorators";
import { Random } from "../utils/random";

export class BunnyModel extends Model<IModelDef.Bunny> {
    constructor(
        config: IModel.RawConfig<IModelDef.Bunny>,
        parent: IModelDef.Bunny[ModelKey.Parent],
        app: App
    ) {
        super(
            {
                timeUpdateDone: () => this.handleTimeUpdateDone()
            },
            {
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
            }, 
            parent,
            app
        );
        this.testcaseDict = {
            eatFoood: this.eatFood,
            spawnChild: this.spawnChild
        };
    }

    protected $initialize() {
        if (!this.$inited) {
            const timer = this.root.childDict.time;
            timer.emitterDict.timeUpdateDone.bindHandler(
                this.$handlerDict.timeUpdateDone
            );
        }
        super.$initialize();
    }

    /** 吃食物 */
    @Decorators.usecase()
    public eatFood() {
        this.$originState.weight += Random.number(1, 5);
    }

    /** 繁殖幼崽 */
    public spawnChild() {
        this.root.spawnCreature({ code: ModelCode.Bunny });
    }

    /** 年龄增长 */
    private handleTimeUpdateDone() {
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