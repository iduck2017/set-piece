import { Model } from ".";
import type { App } from "../app";
import { IModel } from "../type/model";
import { ModelCode } from "../type/registry";

export type TimerModelDefine = IModel.CommonDefine<{
    code: ModelCode.Time,
    state: {
        time: number,
    },
    emitterDefDict: {
        tickBefore: void,
        tickDone: void,
    }
}>

export class TimerModel extends Model<TimerModelDefine> {
    public $handlerCallerDict: IModel.HandlerCallerDict<TimerModelDefine> = {};

    constructor(
        config: IModel.Config<TimerModelDefine>,
        app: App
    ) {
        super(
            {
                ...config,
                originState: {
                    time: 0,
                    ...config.originState
                },
                childBundleDict: {},
                childBundleList: []
            },
            app
        );
        this.debuggerDict.updateTime = this.updateTime.bind(this, 1);
    }
    
    /** 更新时间 */
    public updateTime(offsetTime: number) {
        this.emitterDict.tickBefore.emitEvent();
        this.$originState.time += offsetTime;
        this.emitterDict.tickDone.emitEvent();
    }
}
