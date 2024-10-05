import { SpecModel } from ".";
import { App } from "../app";
import { ModelCode } from "../services/factory";
import { ModelConfig, PureModelConfig } from "../type/model";
import { SpecModelTmpl } from "../type/model-tmpl";
import { BunnyModelTmpl } from "./bunny";
import { TimerModelTmpl } from "./timer";

export type RootModelTmpl = SpecModelTmpl<{
    code: ModelCode.Root,
    info: {
        progress: number,
    },
    childDict: {
        timer: TimerModelTmpl,
    },
    childList: BunnyModelTmpl[],
    parent: App,
}>

export class RootModel extends SpecModel<RootModelTmpl> {
    protected _reactDict = {};

    constructor(config: ModelConfig<RootModelTmpl>) {
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

    public spawnCreature(config: PureModelConfig<BunnyModelTmpl>) {
        const child = this._unserialize(config);
        this._childList.push(child);
        return child;
    }
}
