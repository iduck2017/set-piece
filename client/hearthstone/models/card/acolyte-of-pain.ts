// import { Def } from "@/type/define";
// import { CardDef } from "./card";
// import { Props } from "@/type/props";
// import { MinionDef, MinionModel } from "./minion";
// import { FeatureModel, FeatureDef } from "../feature";
// import { Factory } from "@/service/factory";
// import { Lifecycle } from "@/service/lifecycle";

// /**
//  * @prompt
//  * Acolyte of Pain: 3/1/3 Whenever this minion takes damage, draw a card.
//  */
// export type AcolyteOfPainDef = Def.Create<{
//     code: 'acolyte-of-pain',
//     childDict: {
//         effectAcolyteOfPain: EffectAcolyteOfPainModel
//     }
// }>

// @MinionModel.useRule({
//     manaCost: 3,
//     health: 3,
//     attack: 1,
//     races: []
// })
// @Factory.useProduct('acolyte-of-pain')
// export class AcolyteOfPainModel extends MinionModel<AcolyteOfPainDef> {
//     constructor(props: Props<AcolyteOfPainDef & CardDef & MinionDef>) {
//         const superProps = MinionModel.minionProps(props);
//         super({
//             ...superProps,
//             stateDict: {},
//             paramDict: {
//                 races: [],
//                 name: 'Acolyte of Pain',
//                 desc: 'Whenever this minion takes damage, draw a card.'
//             },
//             childDict: {
//                 effectAcolyteOfPain: { code: 'effect-acolyte-of-pain' },
//                 ...superProps.childDict
//             }
//         });
//     }
// }

// export type EffectAcolyteOfPainDef = Def.Create<{
//     code: 'effect-acolyte-of-pain',
// }>

// @Factory.useProduct('effect-acolyte-of-pain')
// export class EffectAcolyteOfPainModel extends FeatureModel<EffectAcolyteOfPainDef> {
//     constructor(props: Props<EffectAcolyteOfPainDef & FeatureDef>) {
//         super({
//             ...props,
//             paramDict: {
//                 name: 'Acolyte of Pain\'s Effect',
//                 desc: 'Whenever this minion takes damage, draw a card.'
//             },
//             stateDict: {},
//             childDict: {}
//         });
//     }

//     @Lifecycle.useLoader()
//     private _handleDamage() {
//         if (this.card instanceof MinionModel) {
//             const card: MinionModel = this.card;
//             const combatable = card.childDict.combatable;
//             this.bindEvent(
//                 combatable.eventEmitterDict.onHurt,
//                 () => {
//                     card.player.childDict.deck.drawCard();
//                 }
//             );
//         }
//     }
// } 