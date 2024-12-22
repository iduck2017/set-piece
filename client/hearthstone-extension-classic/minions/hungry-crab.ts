import { FactoryService, Props } from "@/set-piece";
import { MinionDef, MinionModel } from "@/hearthstone/models/minion";
import { ClassNameType, RarityType, ExpansionType, RaceType } from "@/hearthstone/services/database";
import { HungryCrabBattlecryModel } from "../battlecry/hungry-crab";

/**
 * Card: Hungry Crab
 * Cost: 1
 * Attack: 1
 * Health: 2
 * Text: Battlecry: Destroy a Murloc and gain +2/+2.
 * Flavor: Murloc. It's what's for dinner.
 */

export type HungryCrabDef = MinionDef<{
    code: 'hungry-crab-minion-card',
    childDict: {
        battlecry: HungryCrabBattlecryModel
    }
}>

@MinionModel.useRule({
    combative: {
        health: 2,
        attack: 1,
        races: [RaceType.Beast]
    },
    castable: {
        manaCost: 1
    },
    card: {
        expansion: ExpansionType.Classic,
        rarity: RarityType.Epic,
        className: ClassNameType.Neutral
    }
})
@FactoryService.useProduct('hungry-crab-minion-card')
export class HungryCrabModel extends MinionModel<HungryCrabDef> {
    constructor(props: Props<HungryCrabDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Hungry Crab',
                desc: 'Battlecry: Destroy a Murloc and gain +2/+2.',
                flavor: 'Murloc. It\'s what\'s for dinner.'
            },
            stateDict: {},
            childDict: {
                battlecry: {
                    code: 'hungry-crab-battlecry-feature'
                },
                ...superProps.childDict
            }
        });
    }
} 