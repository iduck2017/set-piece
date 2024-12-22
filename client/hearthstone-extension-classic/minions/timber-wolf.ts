import { FactoryService, Props } from "@/set-piece";
import { MinionDef, MinionModel } from "@/hearthstone/models/minion";
import { ClassNameType, RarityType, ExpansionType, RaceType } from "@/hearthstone/services/database";
import { TimberWolfFeatureModel } from "../features/timber-wolf";

/**
 * Card: Timber Wolf
 * Cost: 1
 * Attack: 1
 * Health: 1
 * Race: Beast
 * Text: Your other Beasts have +1 Attack.
 * Flavor: Other beasts totally dig hanging out with timber wolves.
 */

export type TimberWolfDef = MinionDef<{
    code: 'timber-wolf-minion-card',
    childDict: {
        ongoingEffect: TimberWolfFeatureModel
    }
}>

@MinionModel.useRule({
    combative: {
        health: 1,
        attack: 1,
        races: [RaceType.Beast]
    },
    castable: {
        manaCost: 1
    },
    card: {
        expansion: ExpansionType.Classic,
        rarity: RarityType.Free,
        className: ClassNameType.Hunter
    }
})
@FactoryService.useProduct('timber-wolf-minion-card')
export class TimberWolfModel extends MinionModel<TimberWolfDef> {
    constructor(props: Props<TimberWolfDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Timber Wolf',
                desc: 'Your other Beasts have +1 Attack.',
                flavor: 'Other beasts totally dig hanging out with timber wolves.'
            },
            stateDict: {},
            childDict: {
                ongoingEffect: {
                    code: 'timber-wolf-ongoing-effect-feature'
                },
                ...superProps.childDict
            }
        });
    }
} 