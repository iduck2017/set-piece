// import { Def } from "@/type/define";
// import { CardDef, TargetCollector } from "./card";
// import { Props } from "@/type/props";
// import { MinionDef, MinionModel } from "./minion";
// import { FeatureModel, FeatureDef } from "../feature";
// import { Factory } from "@/service/factory";
// import { Lifecycle } from "@/service/lifecycle";

// /**
//  * @prompt
//  * Big Game Hunter 3/4/2 Battlecry: Destroy a minion with 7 or more Attack.
//  */

// export type BigGameHunterDef = Def.Create<{
//     code: 'big-game-hunter',
//     childDict: {
//         battlecry: BattlecryBigGameHunterModel
//     }
// }>

// @MinionModel.useRule({
//     manaCost: 3,
//     health: 2,
//     attack: 4,
//     races: []
// })
// @Factory.useProduct('big-game-hunter')
// export class BigGameHunterModel extends MinionModel<BigGameHunterDef> {
//     constructor(props: Props<BigGameHunterDef & CardDef & MinionDef>) {
//         const superProps = MinionModel.minionProps(props);
//         super({
//             ...superProps,
//             stateDict: {},
//             paramDict: {
//                 races: [],
//                 name: 'Big Game Hunter',
//                 desc: 'Battlecry: Destroy a minion with 7 or more Attack.'
//             },
//             childDict: {
//                 battlecry: { code: 'battlecry-big-game-hunter' },
//                 ...superProps.childDict
//             }
//         });
//     }
// }

// export type BattlecryBigGameHunterDef = Def.Create<{
//     code: 'battlecry-big-game-hunter',
// }>

// @Factory.useProduct('battlecry-big-game-hunter')
// export class BattlecryBigGameHunterModel extends FeatureModel<BattlecryBigGameHunterDef> {
//     constructor(props: Props<BattlecryBigGameHunterDef & FeatureDef>) {
//         super({
//             ...props,
//             paramDict: {
//                 name: 'Big Game Hunter\'s Battlecry',
//                 desc: 'Destroy a minion with 7 or more Attack.'
//             },
//             stateDict: {},
//             childDict: {}
//         });
//     }

//     @Lifecycle.useLoader()
//     private _handleBattlecry() {
//         if (!this.minion) return;
//         this.bindEvent(
//             this.minion.eventEmitterDict.onBattlecry,
//             (target, targetCollectorList) => {
//                 const targetCollector = targetCollectorList.find((
//                     item: TargetCollector
//                 ) => item.uuid === this.uuid);
//                 if (targetCollector?.result instanceof MinionModel) {
//                     const card: MinionModel<Def.Pure> = targetCollector.result;
//                     card.childDict.combatable.destroy();
//                 }
//             }
//         );
//     }

//     @Lifecycle.useLoader()
//     private _handleTargetCheck() {
//         this.bindEvent(
//             this.card.eventEmitterDict.onTargetCheck,
//             (targetCollectorList: TargetCollector[]) => {
//                 const minionList = this.card.board.getMinionList({});
//                 const minionGiantList = minionList.filter(
//                     item => {
//                         const combatable = item.childDict.combatable;
//                         return combatable.stateDict.attack >= 7;
//                     }
//                 );
//                 if (minionGiantList.length) {
//                     targetCollectorList.push({
//                         uuid: this.uuid,
//                         hint: 'Choose a minion with 7 or more Attack to destroy.',
//                         validator: (target: MinionModel) => {
//                             const combatable = target.childDict.combatable;
//                             return MinionModel.isOnBoard(target) &&
//                                 combatable.stateDict.attack >= 7;
//                         }
//                     });
//                 }
//             }
//         );
//     }
// } 