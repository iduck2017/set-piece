import { ModelConfig } from "../types/model";
import { TmplModelDef } from "../types/model-def";
import { ModelCode } from "../types/model-code";
import { Model } from ".";

export type TimerModelDef = TmplModelDef<{
    code: ModelCode.Timer,
    info: {
        time: number,
    },
    eventDict: {
        tickBefore: void,
        tickDone: void,
    }
}>

export class TimerModel extends Model<TimerModelDef> {
    protected _reactDict = {};

    constructor(config: ModelConfig<TimerModelDef>) {
        super({
            ...config,
            info: {
                time: config.info?.time || 0
            },
            childDict: {}
        });
    }
    
    /** 更新时间 */
    public readonly tick = (offsetTime: number) => {
        this._eventDict.tickBefore.emitEvent();
        this._originInfo.time += offsetTime;
        this._eventDict.tickDone.emitEvent();
    };
    
    public readonly intf = {};
}
