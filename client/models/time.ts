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
        this.debuggerDict = {
            updateTime: this.updateTime.bind(this)
        };
    }
    
    /** 更新时间 */
    public readonly updateTime = (offsetTime?: number) => {
        if (!offsetTime || offsetTime < 0) {
            offsetTime = 1;
        }

        this._signalDict.timeUpdateBefore.emitEvent();
        this._labileInfo.time += offsetTime;
        this._signalDict.timeUpdateDone.emitEvent();
    };
}
