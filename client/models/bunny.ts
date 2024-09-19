import { Model } from ".";
import type { App } from "../app";
import { IEvent } from "../type/event";
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
    handlerDefDict: {
        tickDone: void,
        timeUpdateDone: IEvent.StateUpdateDone<TimerModelDefine, 'time'>
    }
}>

export class BunnyModel extends Model<BunnyModelDefine> {
    public $handleEvent: IModel.HandlerFuncDict<BunnyModelDefine> = {
        tickDone: this.handleTimeUpdateDone,
        timeUpdateDone: this.handleTimeUpdateDone
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
        this.debug = {
            spawnChild: this.spawnChild
        };
    }

    public initialize() {
        const timer = this.root.childDict.time;
        // timer.emitterDict.timeUpdateDone.bindHandler(
        //     this.$handlerDict.timeUpdateDone
        // );
        timer.emitterDict.tickDone.bindHandler(
            this.$handlerDict.tickDone
        );
    }

    /** 繁殖幼崽 */
    public spawnChild() {
        this.root.spawnCreature({ code: ModelCode.Bunny });
    }

    /** 年龄增长 */
    private handleTimeUpdateDone() {
        this.$originState.age += 1;
        if (this.currentState.age >= this.currentState.maxAge) {
            this.$die();
        }
    }

    private $die() {
        // this.$destroy();
    }
}