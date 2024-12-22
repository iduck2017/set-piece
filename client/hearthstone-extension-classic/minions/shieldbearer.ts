import { Props } from "@/set-piece";
import { FactoryService } from "@/set-piece/services/factory";
import { MinionDef, MinionModel } from "@/hearthstone/models/minion";
import { ClassNameType, ExpansionType, RarityType } from "@/hearthstone/services/database";

/**
 * Card: Shieldbearer
 * Cost: 1
 * Attack: 0
 * Health: 4
 * Text: Taunt
 * Flavor: Have you seen the size of the shields in this game?? This is no easy job.
 */

export type ShieldbearerDef = MinionDef<{
    code: 'shieldbearer-minion-card',
}>

@MinionModel.useRule({
    combative: {
        health: 4,
        attack: 0,
        races: [],
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
        rarity: RarityType.Common,
        className: ClassNameType.Neutral
    }
})
@FactoryService.useProduct('shieldbearer-minion-card')
export class ShieldbearerModel extends MinionModel<ShieldbearerDef> {
    constructor(props: Props<ShieldbearerDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Shieldbearer',
                desc: 'Taunt',
                flavor: 'Have you seen the size of the shields in this game?? This is no easy job.'
            },
            stateDict: {},
            childDict: {
                ...superProps.childDict
            }
        });
    }
} 