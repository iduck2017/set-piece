import { Model } from ".";
import { ModelCode } from "../services/factory";
import { StateUpdateDone } from "../type/event";
import { IModel } from "../type/model";
import { IModelDef } from "../type/model-def";
import { Random } from "../utils/random";
import { TimerModelDef } from "./timer";

export type BunnyModelDef = IModelDef<{
    code: ModelCode.Bunny,
    labileInfo: {
        curAge: number,
        maxAge: number,
    },
    effectDict: {
        timeUpdateDone: symbol
    }
}>

export class BunnyModel extends Model<BunnyModelDef> {
    protected _handlerDict = {
        timeUpdateDone: this.handleTimeUpdateDone
    };

    constructor(config: IModel.Config<BunnyModelDef>) {
        super({
            ...config,
            childDict: {},
            labileInfo: {
                curAge: config.labileInfo?.curAge || 0,
                maxAge: config.labileInfo?.maxAge ||  Random.number(-25, 25) + 100
            },
            stableInfo: {}
        });
        this.testcaseDict = {
            spawnChild: this.spawnChild
        };
    }

    public readonly initialize = () => {
       
    };

    // public bootDriver() {
    //     const timer = this.root.childDict.time;
    //     timer.emitterDict.tickDone.bindHandler(
    //         this._handlerDict.tickDone
    //     );
    // }

    // /** 繁殖幼崽 */
    public spawnChild() {
        this.app.root.spawnCreature({
            code: ModelCode.Bunny
        });
    }

    /** 年龄增长 */
    private handleTimeUpdateDone() {
        this._labileInfo.curAge += 1;
    }

    // public die() {
    //     this.root.removeCreature(this);
    // }
}