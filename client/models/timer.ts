import { Model } from ".";
import { ModelCode } from "../services/factory";
import { IModel } from "../type/model";
import { IModelDef } from "../type/model-def";

export type TimerModelDef = IModelDef<{
    code: ModelCode.Timer,
    labileInfo: {
        time: number,
    },
    signalDict: {
        timeUpdateBefore: void,
        timeUpdateDone: void,
    }
}>

export class TimerModel extends Model<TimerModelDef> {
    protected _handlerDict = {};

    constructor(config: IModel.Config<TimerModelDef>) {
        super({
            ...config,
            childDict: {},
            stableInfo: {},
            labileInfo: {
                time: config.labileInfo?.time || 0
            }
        });
        this.testcaseDict = {
            updateTime: this.updateTime.bind(this, 1)
        };
    }
    
    /** 更新时间 */
    public readonly updateTime = (offsetTime: number) => {
        this._signalDict.timeUpdateBefore.emitEvent();
        this._labileInfo.time += offsetTime;
        this._signalDict.timeUpdateDone.emitEvent();
    };
}
