import { Model } from ".";
import { App } from "../app";
import { ModelCode } from "../services/factory";
import { ModelType } from "../type/model";
import { IModelTmpl } from "../type/model-def";
import { BunnyModelTmpl } from "./bunny";
import { TimerModelTmpl } from "./timer";

export type RootModelTmpl = IModelTmpl<{
    code: ModelCode.Root,
    labileInfo: {
        progress: number,
    },
    childDict: {
        timer: TimerModelTmpl,
    },
    childList: BunnyModelTmpl[],
    parent: App,
}>

export class RootModel extends Model<RootModelTmpl> {
    protected _effectDict = {};

    constructor(config: ModelType.Config<RootModelTmpl>) {
        const childList = config.childList || [];
        if (childList.length === 0) {
            childList.push({
                code: ModelCode.Bunny
            });
        }
        super({
            ...config,
            stableInfo: {},
            labileInfo: {
                progress: config.labileInfo?.progress || 0
            },
            childDict: {
                timer: config.childDict?.timer || {
                    code: ModelCode.Timer
                }
            },
            childList
        });
    }

    public spawnCreature(config: ModelType.PureConfig<BunnyModelTmpl>) {
        const child = this._unserialize(config);
        this._childList.push(child);
        return child;
    }
}
