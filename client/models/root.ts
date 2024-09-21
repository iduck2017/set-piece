import { Model } from ".";
import type { App } from "../app";
import { IModel } from "../type/model";
import { ModelCode } from "../type/registry";
import type { BunnyModel, BunnyModelDefine } from "./bunny";
import { TimerModelDefine } from "./time";

export type RootModelDefine = IModel.CommonDefine<{
    code: ModelCode.Root,
    state: {
        progress: number,
    }
    childDefDict: {
        time: TimerModelDefine,
    }
    childDefList: BunnyModelDefine[],
}>

export class RootModel extends Model<RootModelDefine> {
    public $handlerCallerDict: IModel.EventHandlerCallerDict<RootModelDefine> = {};

    constructor(
        config: IModel.Config<RootModelDefine>,
        app: App
    ) {
        super(
            {
                ...config,
                originState: {
                    progress: 0,
                    ...config.originState
                },
                childBundleDict: {
                    time: config.childBundleDict?.time || {
                        code: ModelCode.Time
                    }
                },
                childBundleList: config.childBundleList || [
                    { code: ModelCode.Bunny }
                ]
            },  
            app
        );
    }

    public spawnCreature(child: BunnyModel) {
        this.$childList.push(child);
        return child;
    }

    public removeCreature(child: BunnyModel) {
        const index = this.$childList.indexOf(child);
        delete this.$childList[index];
    }
}