import { FactoryService, Props } from "@/set-piece";
import { MinionDef, MinionModel } from "@/hearthstone/models/minion";
import { ClassNameType, RarityType, ExpansionType, RaceType } from "@/hearthstone/services/database";
import { MurlocTidecallerFeatureModel } from "../features/murloc-tidecaller";

/**
 * Card: Murloc Tidecaller
 * Cost: 1
 * Attack: 1
 * Health: 2
 * Race: Murloc
 * Text: Whenever a Murloc is summoned, gain +1 Attack.
 * Flavor: This guy gets crazy strong at family reunions.
 */

export type MurlocTidecallerDef = MinionDef<{
    code: 'murloc-tidecaller-minion-card',
    childDict: {
        feature: MurlocTidecallerFeatureModel
    }
}>

@MinionModel.useRule({
    combative: {
        health: 2,
        attack: 1,
        races: [RaceType.Murloc]
    },
    castable: {
        manaCost: 1
    },
    card: {
        expansion: ExpansionType.Classic,
        rarity: RarityType.Rare,
        className: ClassNameType.Neutral
    }
})
@FactoryService.useProduct('murloc-tidecaller-minion-card')
export class MurlocTidecallerModel extends MinionModel<MurlocTidecallerDef> {
    constructor(props: Props<MurlocTidecallerDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Murloc Tidecaller',
                desc: 'Whenever a Murloc is summoned, gain +1 Attack.',
                flavor: 'This guy gets crazy strong at family reunions.'
            },
            stateDict: {},
            childDict: {
                feature: {
                    code: 'murloc-tidecaller-feature'
                },
                ...superProps.childDict
            }
        });
    }
} 