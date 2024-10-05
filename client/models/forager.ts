// import { Model } from ".";
// import type { App } from "../app";
// import { ModelTmpl } from "../type/model-def";
// import { ModelCode } from "../type/registry";

// export type ForagerModelTmpline = IModel.CommonDefine<{
//     code: ModelCode.Forager,
//     state: {
//         energy: number,
//         maxEnergy: number,
//         energyWaste: number,
//     },
//     handlerDefDict: {
//         tickDone: void
//     }
// }>

// export class ForagerModel extends Model<ForagerModelTmpline> {
//     public _handlerCallerDict: IModel.HandlerCallerDict<ForagerModelTmpline> = {
//         tickDone: this.handleTimeUpdateDone
//     };

//     constructor(
//         config: IModel.Config<ForagerModelTmpline>,
//         app: App
//     ) {
//         super(
//             {
//                 ...config,
//                 originState: {
//                     maxEnergy: 100,
//                     energy: config.originState?.maxEnergy || 100,
//                     energyWaste: 1,
//                     ...config.originState
//                 },
//                 childBundleList: [],
//                 childBundleDict: {}
//             }, 
//             app
//         );
//     }

//     public bootDriver(): void {
//         const timer = this.root.childDict.time;
//         timer.emitterDict.tickDone.bindHandler(
//             this._handlerDict.tickDone
//         );
//     }

//     protected handleTimeUpdateDone(): void {
//         this._originState.energy -= this.currentState.energyWaste;
//     }
// }