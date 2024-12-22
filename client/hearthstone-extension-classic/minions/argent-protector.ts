import { FactoryService, Props } from "@/set-piece";
import { MinionDef, MinionModel } from "@/hearthstone/models/minion";
import { ClassNameType, RarityType, ExpansionType } from "@/hearthstone/services/database";
import { ArgentProtectorBattlecryModel } from "../battlecry/argent-protector";

/**
 * Card: Argent Protector
 * Cost: 2
 * Attack: 2
 * Health: 2
 * Text: Battlecry: Give a friendly minion Divine Shield.
 * Flavor: "I'm not saying you can dodge fireballs. I'm saying with this shield, you won't have to."
 */

export type ArgentProtectorDef = MinionDef<{
    code: 'argent-protector-minion-card',
    childDict: {
        battlecry: ArgentProtectorBattlecryModel
    }
}>

@MinionModel.useRule({
    combative: {
        health: 2,
        attack: 2,
        races: []
    },
    castable: {
        manaCost: 2
    },
    card: {
        expansion: ExpansionType.Classic,
        rarity: RarityType.Common,
        className: ClassNameType.Paladin
    }
})
@FactoryService.useProduct('argent-protector-minion-card')
export class ArgentProtectorModel extends MinionModel<ArgentProtectorDef> {
    constructor(props: Props<ArgentProtectorDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Argent Protector',
                desc: 'Battlecry: Give a friendly minion Divine Shield.',
                flavor: '"I\'m not saying you can dodge fireballs. I\'m saying with this shield, you won\'t have to."'
            },
            stateDict: {},
            childDict: {
                battlecry: {
                    code: 'argent-protector-battlecry-feature'
                },
                ...superProps.childDict
            }
        });
    }
} 