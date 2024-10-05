import { Model } from ".";
import { ModelCode } from "../services/factory";
import { ModelType } from "../type/model";
import { IModelDef } from "../type/model-def";
import { Random } from "../utils/random";

export type BunnyModelDef = IModelDef<{
    code: ModelCode.Bunny,
    labileInfo: {
        curAge: number,
        maxAge: number,
    },
    effectDict: {
        timeUpdateDone: void
    }
}>

export class BunnyModel extends Model<BunnyModelDef> {
    protected _effectDict = this._initEffectDict({
        timeUpdateDone: this.handleTimeUpdateDone
    });

    constructor(config: ModelType.Config<BunnyModelDef>) {
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
        this.app.root.childDict.timer.signalDict.timeUpdateDone.bindEffect(
            this._effectDict.timeUpdateDone
        );
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
}