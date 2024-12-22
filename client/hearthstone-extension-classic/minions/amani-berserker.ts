import { FactoryService, Props } from "@/set-piece";
import { MinionDef, MinionModel } from "@/hearthstone/models/minion";
import { AmaniBerserkerFeatureModel } from "../features/amani-berserker";
import { ClassNameType, ExpansionType, RarityType } from "@/hearthstone/services/database";

/**
 * Card: Amani Berserker
 * Cost: 2
 * Attack: 2
 * Health: 3
 * Text: Enrage: +3 Attack.
 * Flavor: If an Amani berserker asks "Joo lookin' at me?!", the correct response is "Nah, mon".
 */

export type AmaniBerserkerDef = MinionDef<{
    code: 'amani-berserker-minion-card',
    childDict: {
        enrage: AmaniBerserkerFeatureModel
    }
}>

@MinionModel.useRule({
    combative: {
        health: 3,
        attack: 2,
        races: []
    },
    castable: {
        manaCost: 2
    },
    card: {
        expansion: ExpansionType.Classic,
        rarity: RarityType.Common,
        className: ClassNameType.Neutral
    }
})
@FactoryService.useProduct('amani-berserker-minion-card')
export class AmaniBerserkerModel extends MinionModel<AmaniBerserkerDef> {
    constructor(props: Props<AmaniBerserkerDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Amani Berserker',
                desc: 'Enrage: +3 Attack.',
                flavor: 'If an Amani berserker asks "Joo lookin\' at me?!", the correct response is "Nah, mon".'
            },
            stateDict: {},
            childDict: {
                enrage: { code: 'amani-berserker-enrage-feature' },
                ...superProps.childDict
            }
        });
    }
} 