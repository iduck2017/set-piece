import { Props } from "@/set-piece";
import { FactoryService } from "@/set-piece/services/factory";
import { MinionDef, MinionModel } from "@/hearthstone/models/minion";
import { ClassNameType, ExpansionType, RarityType } from "@/hearthstone/services/database";
import { FlameImpBattlecryModel } from "../battlecry/flame-imp";

/**
 * @prompt
 * Flame Imp
 * Class: Warlock
 * Expansion: Classic Cards
 * Rarity: Common
 * Cost: 1
 * Attack: 3
 * Health: 2
 * Card Text: Battlecry: Deal 3 damage to your hero.
 * Flavor Text: Imps like being on fire. They just do.
 */

export type FlameImpDef = MinionDef<{
    code: 'flame-imp-minion-card',
    childDict: {
        battlecry: FlameImpBattlecryModel
    }
}>

@MinionModel.useRule({
    combative: {
        health: 2,
        attack: 3,
        races: []
    },
    castable: {
        manaCost: 1
    },
    card: {
        expansion: ExpansionType.Classic,
        rarity: RarityType.Common,
        className: ClassNameType.Warlock
    }
})
@FactoryService.useProduct('flame-imp-minion-card')
export class FlameImpModel extends MinionModel<FlameImpDef> {
    constructor(props: Props<FlameImpDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: "Flame Imp",
                desc: "Battlecry: Deal 3 damage to your hero.",
                flavor: "Imps like being on fire. They just do."
            },
            stateDict: {},
            childDict: {
                battlecry: { code: 'flame-imp-battlecry-feature' },
                ...superProps.childDict
            }
        });
    }
} 