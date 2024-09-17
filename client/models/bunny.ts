import { Model } from ".";
import type { App } from "../app";
import { IModel } from "../type/model";
import { ModelCode } from "../type/registry";
import { Random } from "../utils/random";
import { ForagerModelDefine } from "./forager";
import { TimerModelDefine } from "./time";

export type BunnyModelDefine = IModel.CommonDefine<{
    code: ModelCode.Bunny,
    state: {
        age: number,
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
        app: App
    ) {
        super(
            {
                ...config,
                code: ModelCode.Bunny,
                originState: {
                    age: 0,
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
            app
        );
        this.debuggerDict = {
            spawnChild: this.spawnChild
        };
    }

    public activate() {
        if (!this.$activated) {
            const timer = this.root.childDict.time;
            timer.eventChannelDict.listened.tickDone.bind(this);
        }
    }

    /** 吃食物 */
    // @Decorators.usecase()
    // public eatFood() {
    //     this.$originState.weight += Random.number(1, 5);
    // }

    /** 繁殖幼崽 */
    public spawnChild() {
        this.root.spawnCreature({ code: ModelCode.Bunny });
    }

    /** 年龄增长 */
    private handleTimeUpdateDone() {
        console.log('handleTimeUpdateDone');
        this.$originState.age += 1;
        if (this.currentState.age >= this.currentState.maxAge) {
            this.$die();
        }
    }

    private $die() {
        this.$destroy();
    }
}