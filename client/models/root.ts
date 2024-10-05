import { Model } from ".";
import { App } from "../app";
import { ModelCode } from "../services/factory";
import { IModel } from "../type/model";
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
    protected _handlerDict = {};

    constructor(config: IModel.Config<RootModelDef>) {
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

    public spawnCreature(config: IModel.RawConfig<BunnyModelDef>) {
        const child = this._unserialize(config);
        this._childList.push(child);
        return child;
    }
}

// export class RootModel extends Model<RootModelDef> {

//     constructor(
//         config: IModel.Config<RootModelDef>,
//         app: App
//     ) {
//         super(
//             {
//                 ...config,
//                 originState: {
//                     progress: 0,
//                     ...config.originState
//                 },
//                 childBundleDict: {
//                     time: config.childBundleDict?.time || {
//                         code: ModelCode.Time
//                     }
//                 },
//                 childBundleList: config.childBundleList || [
//                     { code: ModelCode.Bunny }
//                 ]
//             },  
//             app
//         );
//     }

//     public spawnCreature(child: BunnyModel) {
//         this._childList.push(child);
//         return child;
//     }

//     public removeCreature(child: BunnyModel) {
//         const index = this._childList.indexOf(child);
//         delete this._childList[index];
//     }
// }