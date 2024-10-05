import { Model } from ".";
import { App } from "../app";
import { ModelCode } from "../services/factory";
import { ModelType } from "../type/model";
import { IModelDef } from "../type/model-def";
import { BunnyModelDef } from "./bunny";
import { TimerModelDef } from "./timer";

export type RootModelDef = IModelDef<{
    code: ModelCode.Root,
    labileInfo: {
        progress: number,
    },
    childDict: {
        timer: TimerModelDef,
    },
    childList: BunnyModelDef[],
    parent: App,
}>

export class RootModel extends Model<RootModelDef> {
    protected _effectDict = {};

    constructor(config: ModelType.Config<RootModelDef>) {
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

    public spawnCreature(config: ModelType.PureConfig<BunnyModelDef>) {
        const child = this._unserialize(config);
        this._childList.push(child);
        return child;
    }
}
