import { Model } from ".";
import type { App } from "../app";
import { Generator } from "../configs/generator";
import { IModel } from "../type/model";
import { ModelCode } from "../type/registry";

export type TimerModelDefine = IModel.CommonDefine<{
    code: ModelCode.Time,
    state: {
        time: number,
    },
    eventDict: {
        tickBefore: void,
        tickDone: void,
    }
}>

export class TimerModel extends Model<TimerModelDefine> {
    protected $eventHandlerDict: IModel.EventHandlerDict<TimerModelDefine> = 
        Generator.pureHandlerDict();

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
        this.$eventEmitterDict.listened.tickBefore();
        this.$originState.time += offsetTime;
        this.$eventEmitterDict.listened.tickDone();
    }
}
