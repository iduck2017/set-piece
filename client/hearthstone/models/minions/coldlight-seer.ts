// import { Def } from "@/type/define";
// import { CardDef } from "./card";
// import { Props } from "@/type/props";
// import { MinionDef, MinionModel } from "./minion";
// import { FeatureModel, FeatureDef } from "../feature";
// import { Factory } from "@/service/factory";
// import { RaceType } from "@/service/database";
// import { Lifecycle } from "@/service/lifecycle";
// import { BuffModel } from "../buff";

// /**
//  * @prompt
//  * Coldlight Seer 3/2/3 Battlecry: Give your other Murlocs +2 Health.
//  */
// export type ColdlightSeerDef = Def.Create<{
//     code: 'coldlight-seer',
//     childDict: {
//         battlecry: BattlecryColdlightSeerModel
//     }
// }>

// @MinionModel.useRule({
//     manaCost: 3,
//     health: 3,
//     attack: 2,
//     races: [ RaceType.Murloc ]
// })
// @Factory.useProduct('coldlight-seer')
// export class ColdlightSeerModel extends MinionModel<ColdlightSeerDef> {
//     constructor(props: Props<ColdlightSeerDef & CardDef & MinionDef>) {
//         const superProps = MinionModel.minionProps(props);
//         super({
//             ...superProps,
//             stateDict: {},
//             paramDict: {
//                 races: [ RaceType.Murloc ],
//                 name: 'Coldlight Seer',
//                 desc: 'Battlecry: Give your other Murlocs +2 Health.'
//             },
//             childDict: {
//                 battlecry: { code: 'battlecry-coldlight-seer' },
//                 ...superProps.childDict
//             }
//         });
//     }
// }

// export type BattlecryColdlightSeerDef = Def.Create<{
//     code: 'battlecry-coldlight-seer',
//     parent: ColdlightSeerModel
// }>

// @Factory.useProduct('battlecry-coldlight-seer')
// export class BattlecryColdlightSeerModel extends FeatureModel<BattlecryColdlightSeerDef> {
//     constructor(props: Props<BattlecryColdlightSeerDef & FeatureDef>) {
//         super({
//             ...props,
//             paramDict: {
//                 name: 'Coldlight Seer\'s Battlecry',
//                 desc: 'Give your other Murlocs +2 Health.'
//             },
//             stateDict: {},
//             childDict: {}
//         });
//     }

//     @Lifecycle.useLoader()
//     private _handleBattlecry() {
//         if (this.card instanceof MinionModel) {
//             this.bindEvent(
//                 this.card.eventEmitterDict.onBattlecry,
//                 () => {
//                     const minionList = this.card.board.getMinionList({
//                         excludeTarget: this.minion,
//                         requiredRaces: [ RaceType.Murloc ]
//                     });
//                     minionList.forEach(target => {
//                         target.childDict.featureList.addFeature<
//                             BuffColdlightSeerModel
//                         >({
//                             code: 'buff-coldlight-seer'
//                         });
//                     });
//                 }
//             );
//         }
//     }
// } 

// export type BuffColdlightSeerDef = Def.Create<{
//     code: 'buff-coldlight-seer',
//     parent: ColdlightSeerModel
// }>  


// @Factory.useProduct('buff-coldlight-seer')
// export class BuffColdlightSeerModel extends BuffModel<BuffColdlightSeerDef> {
//     constructor(props: Props<BuffColdlightSeerDef & FeatureDef>) {
//         super({
//             ...props,
//             paramDict: {
//                 name: 'Coldlight Seer\'s Buff',
//                 desc: 'Give your other Murlocs +2 Health.',
//                 modAttack: 0,
//                 modHealth: 2
//             },
//             stateDict: {},
//             childDict: {}
//         });
//     }
// }
