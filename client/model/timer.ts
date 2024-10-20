import { TmplModelConfig } from "../type/model/config";
import { TmplModelDef } from "../type/model/define";
import { Model } from ".";
import { useProduct } from "../utils/decor/product";

export type TimerModelDef = TmplModelDef<{
    code: 'timer',
    state: {
        time: number,
    },
    signalDict: {
        tickBefore: void,
        tickDone: void,
    },
    methodDict: {
        updateTime: (offsetTime: number) => void,
    }
}>

@useProduct('timer')
export class TimerModel extends Model<TimerModelDef> {

    constructor(config: TmplModelConfig<TimerModelDef>) {
        super({
            ...config,
            state: {
                time: config.state?.time || 0
            },
            childDict: {}
        });
    }
    
    /** 更新时间 */
    public readonly updateTime = (offsetTime: number) => {
        this._signalDict.tickBefore.emitSignal();
        this._originState.time += offsetTime;
        this._signalDict.tickDone.emitSignal();
    };
    
    protected _effectDict = {};
    
    public readonly methodDict = {
        updateTime: this.updateTime.bind(this)
    };
}
