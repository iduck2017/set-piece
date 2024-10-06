import { SpecModel } from ".";
import { ModelCode } from "../services/factory";
import { ModelConfig } from "../type/model";
import { SpecModelTmpl } from "../type/model-tmpl";

export type TimerModelTmpl = SpecModelTmpl<{
    code: ModelCode.Timer,
    info: {
        time: number,
    },
    eventDict: {
        timeUpdateBefore: void,
        timeUpdateDone: void,
    }
}>

export class TimerModel extends SpecModel<TimerModelTmpl> {
    protected _reactDict = {};

    constructor(config: ModelConfig<TimerModelTmpl>) {
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
