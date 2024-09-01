import { Model } from ".";
import type { App } from "../app";
import { BunnyModelDef } from "../type/definition";
import { ModelType } from "../type/model";
import { ModelCode, ModelKey } from "../type/registry";
import { Decorators } from "../utils/decorators";
import { Random } from "../utils/random";

export class BunnyModel extends Model<BunnyModelDef> {
    constructor(
        config: ModelType.RawConfig<BunnyModelDef>,
        parent: BunnyModelDef[ModelKey.Parent],
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
                    maxAge: 100
                },
                childChunkList: config.childChunkList || [],
                childChunkDict: {
                    forager: config.childChunkDict?.forager || {
                        code: ModelCode.Forager,
                        originState: {
                            energyWaste: 1,
                            maxEnergy: Random.number(50, 100)
                        }
                    }
                }
            }, 
            parent,
            app
        );
        this.testcaseDict = {
            eatFoood: this.eatFood,
            spawnChild: this.spawnChild
        };
    }

    public $initialize() {
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
        const bunny = this.root.spawnCreature({ code: ModelCode.Bunny });
        bunny.$initialize();
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