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
        timeUpdateBefore: void,
        timeUpdateDone: void,
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
        this.apiDict = {
            updateTime: this._updateTime.bind(this, 1)
        };
    }
    
    /** 更新时间 */
    private readonly _updateTime = (offsetTime: number) => {
        this._eventDict.timeUpdateBefore.emitEvent();
        this._originInfo.time += offsetTime;
        this._eventDict.timeUpdateDone.emitEvent();
    };
}
