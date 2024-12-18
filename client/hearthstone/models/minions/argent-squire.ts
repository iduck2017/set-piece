// import { Def } from "@/type/define";
// import { CardDef } from "./card";
// import { Props } from "@/type/props";
// import { MinionDef, MinionModel } from "./minion";
// import { Factory } from "@/service/factory";

// /**
//  * @prompt
//  * Argent Squire 1/1/1 Divine Shield
//  * use CombatableModel isDivineShield state
//  */

// export type ArgentSquireDef = Def.Create<{
//     code: 'argent-squire'
// }>


// @MinionModel.useRule({
//     manaCost: 1,
//     health: 1,
//     attack: 1,
//     races: [],
//     isDivineShield: true 
// })
// @Factory.useProduct('argent-squire')
// export class ArgentSquireModel extends MinionModel<ArgentSquireDef> {
//     constructor(props: Props<ArgentSquireDef & CardDef & MinionDef>) {
//         const superProps = MinionModel.minionProps(props);
//         super({
//             ...superProps,
//             stateDict: {},
//             paramDict: {
//                 races: [],
//                 name: 'Argent Squire',
//                 desc: 'Divine Shield'
//             }
//         });
//     }
// } 