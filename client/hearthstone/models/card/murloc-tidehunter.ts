// import { Def } from "@/type/define";
// import { CardDef } from "./card";
// import { Props } from "@/type/props";
// import { MinionDef, MinionModel } from "./minion";
// import { FeatureModel, FeatureDef } from "../feature";
// import { Factory } from "@/service/factory";
// import { Lifecycle } from "@/service/lifecycle";
// import { DataBase, RaceType } from "@/service/database";

// /**
//  * @prompt
//  * Murloc Tidehunter Battlecry: Summon a 1/1 Murloc Scout.
//  * use NoviceEngineerModel as reference.
//  */

// export type MurlocTidehunterDef = Def.Create<{
//     code: 'murloc-tidehunter',
//     childDict: {
//         battlecry: BattlecryMurlocTidehunterModel
//     }
// }>

// @DataBase.useCard({
// })
// @MinionModel.useRule({
//     manaCost: 2,
//     health: 1,
//     attack: 2,
//     races: [ RaceType.Murloc ]
// })
// @Factory.useProduct('murloc-tidehunter')
// export class MurlocTidehunterModel extends MinionModel<MurlocTidehunterDef> {
//     constructor(props: Props<MurlocTidehunterDef & CardDef & MinionDef>) {
//         const superProps = MinionModel.minionProps(props);
//         super({
//             ...superProps,
//             stateDict: {},
//             paramDict: {
//                 races: [ RaceType.Murloc ],
//                 name: 'Murloc Tidehunter',
//                 desc: 'Battlecry: Summon a 1/1 Murloc Scout.'
//             },
//             childDict: {
//                 battlecry: { code: 'battlecry-murloc-tidehunter' },
//                 ...superProps.childDict
//             }
//         });
//     }

//     debug() {
//         super.debug();
//         this.childDict.battlecry.debug();
//     }
// }

// export type BattlecryMurlocTidehunterDef = Def.Create<{
//     code: 'battlecry-murloc-tidehunter',
//     parent: MurlocTidehunterModel
// }>

// @Factory.useProduct('battlecry-murloc-tidehunter')
// export class BattlecryMurlocTidehunterModel extends FeatureModel<BattlecryMurlocTidehunterDef> {
//     constructor(props: Props<BattlecryMurlocTidehunterDef & FeatureDef>) {
//         super({
//             ...props,
//             paramDict: {
//                 name: 'Murloc Tidehunter\'s Battlecry',
//                 desc: 'Summon a 1/1 Murloc Scout.'
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
//                     const board = this.card.player.childDict.board;
//                     board.summonMinion({
//                         code: 'murloc-scout'
//                     });
//                 }
//             );
//         }
//     }
// }

// // murloc scout
// export type MurlocScoutDef = Def.Create<{
//     code: 'murloc-scout'
// }>

// @MinionModel.useRule({
//     manaCost: 1,
//     health: 1,
//     attack: 1,
//     races: [ RaceType.Murloc ]
// }, true)
// @Factory.useProduct('murloc-scout')
// export class MurlocScoutModel extends MinionModel<MurlocScoutDef> {
//     constructor(props: Props<MurlocScoutDef & CardDef & MinionDef>) {
//         const superProps = MinionModel.minionProps(props);
//         super({
//             ...superProps,
//             stateDict: {},
//             paramDict: {
//                 races: [ RaceType.Murloc ],
//                 name: 'Murloc Scout',
//                 desc: ''
//             },
//             childDict: {
//                 ...superProps.childDict
//             }
//         });
//     }
// }
