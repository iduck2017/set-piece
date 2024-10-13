import { ModelConfig } from "../configs/model";
import { SpecModelDef } from "../configs/model-def";
import { ModelCode } from "../configs/model-code";
import { SpecModel } from "./specific";

export type TimerModelDef = SpecModelDef<{
    code: ModelCode.Timer,
    info: {
        time: number,
    },
    eventDict: {
        tickBefore: void,
        tickDone: void,
    }
}>

export class TimerModel extends SpecModel<TimerModelDef> {
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
}
