import { Model } from ".";
import type { App } from "../app";
import { IModelDef } from "../type/definition";
import { ModelDecl } from "../type/model";
import { ModelKey } from "../type/registry";

export class TimeModel extends Model<IModelDef.Time> {
    constructor(
        config: ModelDecl.RawConfig<IModelDef.Time>,
        parent: IModelDef.Time[ModelKey.Parent],
        app: App
    ) {
        super(
            {},
            {
                ...config,
                originState: {
                    time: 0,
                    ...config.originState
                },
                childChunkDict: {},
                childChunkList: []
            },
            parent,
            app
        );
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
