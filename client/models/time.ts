import { Model } from ".";
import type { App } from "../app";
import { IModelDef, ModelKey } from "../type/definition";
import { IModel } from "../type/model";

export class TimeModel extends Model<IModelDef.Time> {
    constructor(
        config: IModel.RawConfig<IModelDef.Time>,
        parent: IModelDef.Time[ModelKey.Parent],
        app: App
    ) {
        super({
            ...config,
            originState: {
                time: 0,
                ...config.originState
            },
            childChunkDict: {},
            childChunkList: []
        }, parent, app);
        console.log("TimeModel created");
        this.testcaseDict.updateTime = this.updateTime.bind(this, 1);
    }
    
    /** 更新时间 */
    public updateTime(offsetTime: number) {
        this.$emitterDict.timeUpdateBefore.emitEvent();
        this.$originState.time += offsetTime;
        this.$emitterDict.timeUpdateDone.emitEvent();
    }
}
