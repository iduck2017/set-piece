import { CustomDef, Def, FactoryService, Props } from "@/set-piece";
import { MinionDef, MinionModel } from "@/hearthstone/models/minion";
import { ElvenArcherBattlecryModel } from "../battlecry/elven-archer";
import { ClassNameType, ExpansionType, RarityType } from "@/hearthstone/services/database";

/**
 * @prompt
 * Elven Archer 1/1/1
 * Card Text: Battlecry: Deal 1 damage.
 * Flavor Text: Don't bother asking her out on a date. She'll shoot you down.
 */

export type ElvenArcherDef = MinionDef<{
    code: 'elven-archer-minion-card',
    childDict: {
        battlecry: ElvenArcherBattlecryModel
    }
}>

@MinionModel.useRule({
    combative: {
        health: 1,
        attack: 1,
        races: []
    },
    castable: {
        manaCost: 1
    },
    card: {
        expansion: ExpansionType.Classic,
        rarity: RarityType.Common,
        className: ClassNameType.Neutral
    }
})
@FactoryService.useProduct('elven-archer-minion-card')
export class ElvenArcherModel extends MinionModel<ElvenArcherDef> {
    constructor(props: Props<ElvenArcherDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Elven Archer',
                desc: 'Battlecry: Deal 1 damage.',
                flavor: 'Don\'t bother asking her out on a date. She\'ll shoot you down.'
            },
            stateDict: {},
            childDict: {
                battlecry: { code: 'elven-archer-battlecry-feature' },
                ...superProps.childDict
            }
        });
    }
} 