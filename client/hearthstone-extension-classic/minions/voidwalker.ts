import { Props } from "@/set-piece";
import { FactoryService } from "@/set-piece/services/factory";
import { MinionDef, MinionModel } from "@/hearthstone/models/minion";
import { ClassNameType, ExpansionType, RarityType, RaceType } from "@/hearthstone/services/database";

/**
 * Card: Voidwalker
 * Cost: 1
 * Attack: 1
 * Health: 3
 * Race: Demon
 * Text: Taunt
 * Flavor: No relation to "The Voidsteppers", the popular Void-based dance troupe.
 */

export type VoidwalkerDef = MinionDef<{
    code: 'voidwalker-minion-card',
}>

@MinionModel.useRule({
    combative: {
        health: 3,
        attack: 1,
        races: [RaceType.Demon],
        isTaunt: true
    },
    taunt: {
        isActived: true
    },
    castable: {
        manaCost: 1
    },
    card: {
        expansion: ExpansionType.Classic,
        rarity: RarityType.Free,
        className: ClassNameType.Warlock
    }
})
@FactoryService.useProduct('voidwalker-minion-card')
export class VoidwalkerModel extends MinionModel<VoidwalkerDef> {
    constructor(props: Props<VoidwalkerDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Voidwalker',
                desc: 'Taunt',
                flavor: 'No relation to "The Voidsteppers", the popular Void-based dance troupe.'
            },
            stateDict: {},
            childDict: {
                ...superProps.childDict
            }
        });
    }
} 