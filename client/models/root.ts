import { Model } from ".";
import { App } from "../app";
import { ModelCode } from "../services/factory";
import { IModel } from "../type/model";
import { IModelDef } from "../type/model-def";

export type RootModelDef = IModelDef<{
    code: ModelCode.Root,
    labileInfo: {
        progress: number,
    },
    parent: App,
}>

export class RootModel extends Model<RootModelDef> {
    protected _handlerDict = {};

    constructor(config: IModel.Config<RootModelDef>) {
        super({
            ...config,
            stableInfo: {},
            labileInfo: {
                progress: config.labileInfo?.progress || 0
            },
            childDict: {}
        });
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