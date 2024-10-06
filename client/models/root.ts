import { SpecModel } from ".";
import { App } from "../app";
import { ModelCode } from "../services/factory";
import { ModelConfig, PureModelConfig } from "../type/model";
import { SpecModelDef } from "../type/model-def";
import { BunnyModelDef } from "./bunny";
import { TimerModelDef } from "./timer";

export type RootModelDef = SpecModelDef<{
    code: ModelCode.Root,
    info: {
        progress: number,
    },
    childDict: {
        timer: TimerModelDef,
    },
    childList: BunnyModelDef[],
    parent: App,
}>

export class RootModel extends SpecModel<RootModelDef> {
    protected _reactDict = {};

    constructor(config: ModelConfig<RootModelDef>) {
        const childList = config.childList || [];
        if (childList.length === 0) {
            childList.push({
                code: ModelCode.Bunny
            });
        }
        super({
            ...config,
            info: {
                progress: config.info?.progress || 0
            },
            childDict: {
                timer: config.childDict?.timer || {
                    code: ModelCode.Timer
                }
            },
            childList
        });
    }

    public spawnCreature(config: PureModelConfig<BunnyModelDef>) {
        const child = this._unserialize(config);
        this._childList.push(child);
        return child;
    }
}
