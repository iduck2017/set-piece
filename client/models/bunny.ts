import { Model } from ".";
import type { App } from "../app";
import { IModel } from "../type/model";
import { ModelCode } from "../type/registry";
import { Decorators } from "../utils/decorators";
import { Random } from "../utils/random";
import { ForagerModelDefine } from "./forager";
import { TimerModelDefine } from "./time";

export type BunnyModelDefine = IModel.CommonDefine<{
    code: ModelCode.Bunny,
    state: {
        age: number,
        weight: number,
        maxAge: number,
    },
    childDefDict: {
        forager: ForagerModelDefine,
    },
    listenedDefDict: {
        tickDone: TimerModelDefine
    },
    observedDefDict: {
        time: TimerModelDefine
    },
}>

export class BunnyModel extends Model<BunnyModelDefine> {
    protected $eventHandlerDict: IModel.EventHandlerDict<BunnyModelDefine> = {
        listener: {
            tickDone: this.handleTimeUpdateDone
        },
        observer: {
            time: this.handleTimeUpdateDone
        },
        modifier: {}
    };

    constructor(
        config: IModel.Config<BunnyModelDefine>,
        parent: IModel.Parent<BunnyModelDefine>,
        app: App
    ) {
        super(
            {
                ...config,
                code: ModelCode.Bunny,
                originState: {
                    age: 0,
                    weight: Random.number(30, 50),
                    ...config.originState,
                    maxAge: 100
                },
                childBundleList: [],
                childBundleDict: {
                    forager: config.childBundleDict?.forager || {
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
        this.debuggerDict = {
            eatFoood: this.eatFood,
            spawnChild: this.spawnChild
        };
    }

    public $initialize() {
        if (!this.$inited) {
            const timer = this.root.childDict.time;
            timer.eventChannelDict.listened.tickDone.bind(this);
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
        this.$originState.age += 1;
        if (this.currentState.age >= this.currentState.maxAge) {
            this.$die();
        }
    }

    private $die() {
        this.$destroy();
    }
}