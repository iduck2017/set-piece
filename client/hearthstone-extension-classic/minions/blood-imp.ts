import { Props } from "@/set-piece";
import { FactoryService } from "@/set-piece/services/factory";
import { MinionDef, MinionModel } from "@/hearthstone/models/minion";
import { ClassNameType, ExpansionType, RarityType } from "@/hearthstone/services/database";
import { BloodImpFeatureModel } from "../features/blood-imp";

/**
 * @prompt
 * Blood Imp
 * Class: Warlock
 * Expansion: Classic Cards
 * Rarity: Common
 * Cost: 1
 * Attack: 0
 * Health: 1
 * Card Text: Stealth. At the end of your turn, give another random friendly minion +1 Health.
 * Flavor Text: Imps are content to hide and viciously taunt everyone nearby.
 * Keywords: Stealth - Can't be attacked or targeted until it attacks.
 */

export type BloodImpDef = MinionDef<{
    code: 'blood-imp-minion-card',
    childDict: {
        turnEnd: BloodImpFeatureModel
    }
}>

@MinionModel.useRule({
    combative: {
        health: 1,
        attack: 0,
        races: [],
        isStealth: true
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
@FactoryService.useProduct('blood-imp-minion-card')
export class BloodImpModel extends MinionModel<BloodImpDef> {
    constructor(props: Props<BloodImpDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: "Blood Imp",
                desc: "Stealth. At the end of your turn, give another random friendly minion +1 Health.",
                flavor: "Imps are content to hide and viciously taunt everyone nearby."
            },
            stateDict: {},
            childDict: {
                turnEnd: { code: 'blood-imp-turn-end-feature' },
                ...superProps.childDict
            }
        });
    }
} 