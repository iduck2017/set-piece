// import { Def } from "@/type/define";
// import { CardDef } from "./card";
// import { Props } from "@/type/props";
// import { MinionDef, MinionModel } from "./minion";
// import { FeatureModel, FeatureDef } from "../feature";

// import { Factory } from "@/service/factory";
// import { Lifecycle } from "@/service/lifecycle";
// import { CombatableModel } from "../combatable";
// import { Model } from "@/type/model";
// import { Mutable } from "utility-types";

// /**
//  * @prompt
//  * Angry Chicken 1/1  Enrage: +5 Attack.
//  * use CombatableModel event onHurt as reference
//  * use NoviceEngineerModel as reference 
//  */
// export type AngryChickenDef = Def.Create<{
//     code: 'angry-chicken',
//     childDict: {
//         enrage: EnrageAngryChickenModel
//     }
// }>


// @MinionModel.useRule({
//     manaCost: 1,
//     health: 1,
//     attack: 1,
//     races: []
// })
// @Factory.useProduct('angry-chicken')
// export class AngryChickenModel extends MinionModel<AngryChickenDef> {
//     constructor(props: Props<AngryChickenDef & CardDef & MinionDef>) {
//         const superProps = MinionModel.minionProps(props);
//         super({
//             ...superProps,
//             stateDict: {},
//             paramDict: {
//                 races: [],
//                 name: 'Angry Chicken',
//                 desc: 'Enrage: +5 Attack.'
//             },
//             childDict: {
//                 enrage: { code: 'enrage-angry-chicken' },
//                 ...superProps.childDict
//             }
//         });
//     }

//     debug() {
//         super.debug();
//         this.childDict.enrage.debug();
//     }
// }

// export type EnrageAngryChickenDef = Def.Create<{
//     code: 'enrage-angry-chicken',
// }>

// @Factory.useProduct('enrage-angry-chicken')
// export class EnrageAngryChickenModel extends FeatureModel<EnrageAngryChickenDef> {
//     constructor(props: Props<EnrageAngryChickenDef & FeatureDef>) {
//         super({
//             ...props,
//             paramDict: {
//                 name: 'Angry Chicken\'s Enrage',
//                 desc: '+5 Attack.'
//             },
//             stateDict: {},
//             childDict: {}
//         });
//     }

//     @Lifecycle.useLoader()
//     private _handleEnrage() {
//         const combatable = this.minion?.childDict.combatable;
//         if (!combatable) return;
            
//         // 监听受伤事件
//         this.bindEvent(
//             combatable.eventEmitterDict.onStateAlter,
//             (target, prevState) => {
//                 const nextState = target.stateDict;
//                 if (
//                     nextState.curHealth < nextState.maxHealth && 
//                         prevState.curHealth >= prevState.maxHealth
//                 ) {
//                     this.bindEvent(
//                         combatable.eventEmitterDict.onParamCheck,
//                         this._handleBuff
//                     );
//                 }
//                 if (
//                     nextState.curHealth >= nextState.maxHealth &&
//                         prevState.curHealth < prevState.maxHealth
//                 ) {
//                     this.unbindEvent(
//                         combatable.eventEmitterDict.onParamCheck,
//                         this._handleBuff
//                     );
//                 }
//             }
//         );

//         // // 监听治疗事件，当血量恢复满时取消激怒效果
//         // this.bindEvent(
//         //     combatable.eventEmitterDict.onStateAlter,
//         //     (target) => {
//         //         if (
//         //             target.stateDict.curHealth >= target.stateDict.maxHealth &&
//         //             this.baseStateDict.isEnraged
//         //         ) {
//         //             this.baseStateDict.isEnraged = false;
//         //             this.unbindEvent(
//         //                 combatable.eventEmitterDict.onParamCheck,
//         //                 this._handleBuff.bind(this)
//         //             );
//         //         }
//         //     }
//         // );
//     }

//     private _handleBuff(
//         target: CombatableModel,
//         param: Mutable<Model.ParamDict<CombatableModel>>
//     ) {
//         param.attack += 5;
//     }
// }
